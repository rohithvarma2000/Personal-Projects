import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { site } from '../config/site'
import { fetchRepos, GitHubError, isFresh, rankRepos, readCache, type Repo } from '../lib/github'

type Status = 'loading' | 'ready' | 'error'
interface State {
  status: Status
  repos: Repo[]            // own, non-fork repos, ranked
  error: GitHubError | null
  stale: boolean           // showing cached data after a failed refresh
  refresh: () => void
}
const Ctx = createContext<State | null>(null)

export function GitHubProvider({ children }: { children: ReactNode }) {
  const [repos, setRepos] = useState<Repo[]>(() => readCache(site.githubUsername)?.repos ?? [])
  const [status, setStatus] = useState<Status>(() => (readCache(site.githubUsername) ? 'ready' : 'loading'))
  const [error, setError] = useState<GitHubError | null>(null)
  const [stale, setStale] = useState(false)
  const ctl = useRef<AbortController | null>(null)

  const load = useCallback((force: boolean) => {
    const cached = readCache(site.githubUsername)
    if (!force && isFresh(cached)) return
    ctl.current?.abort()
    const c = new AbortController()
    ctl.current = c
    if (!cached) setStatus('loading')
    fetchRepos(site.githubUsername, c.signal)
      .then((r) => { setRepos(r); setStatus('ready'); setError(null); setStale(false) })
      .catch((e: unknown) => {
        if ((e as Error).name === 'AbortError') return
        setError(e instanceof GitHubError ? e : new GitHubError('network', 'Unexpected error.'))
        if (cached) { setStale(true); setStatus('ready') } else setStatus('error')
      })
  }, [])

  useEffect(() => { load(false); return () => ctl.current?.abort() }, [load])

  const value = useMemo<State>(() => ({
    status, error, stale, refresh: () => load(true),
    repos: rankRepos(repos.filter((r) => !r.fork), site.featuredRepos),
  }), [status, error, stale, repos, load])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useGitHub() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useGitHub must be used inside GitHubProvider')
  return v
}
