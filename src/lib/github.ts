export interface Repo {
  id: number
  name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  updatedAt: string
  url: string
  homepage: string | null
  topics: string[]
  fork: boolean
  archived: boolean
}

export type GitHubErrorKind = 'rate-limit' | 'not-found' | 'network' | 'http'
export class GitHubError extends Error {
  constructor(public kind: GitHubErrorKind, message: string, public resetAt?: Date) { super(message) }
}

const TTL_MS = 15 * 60 * 1000
const key = (u: string) => `gh-repos:v1:${u}`

interface Cached { at: number; repos: Repo[] }

export function readCache(user: string): Cached | null {
  try {
    const raw = localStorage.getItem(key(user))
    return raw ? (JSON.parse(raw) as Cached) : null
  } catch { return null }
}
function writeCache(user: string, repos: Repo[]) {
  try { localStorage.setItem(key(user), JSON.stringify({ at: Date.now(), repos })) } catch { /* storage unavailable */ }
}
export const isFresh = (c: Cached | null) => !!c && Date.now() - c.at < TTL_MS

interface ApiRepo {
  id: number; name: string; description: string | null; language: string | null
  stargazers_count: number; forks_count: number; pushed_at: string | null; updated_at: string
  html_url: string; homepage: string | null; topics?: string[]; fork: boolean; archived: boolean
}

/** Public REST API, no token. Cached in localStorage; falls back to stale cache on failure. */
export async function fetchRepos(user: string, signal?: AbortSignal): Promise<Repo[]> {
  let res: Response
  try {
    res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated&type=owner`, {
      signal, headers: { Accept: 'application/vnd.github+json' },
    })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    throw new GitHubError('network', 'Could not reach GitHub.')
  }
  if (res.status === 404) throw new GitHubError('not-found', `GitHub user "${user}" was not found.`)
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('x-ratelimit-reset')
    throw new GitHubError('rate-limit', 'GitHub rate limit reached.', reset ? new Date(Number(reset) * 1000) : undefined)
  }
  if (!res.ok) throw new GitHubError('http', `GitHub returned ${res.status}.`)
  const data = (await res.json()) as ApiRepo[]
  const repos: Repo[] = data.map((r) => ({
    id: r.id, name: r.name, description: r.description, language: r.language,
    stars: r.stargazers_count, forks: r.forks_count, updatedAt: r.pushed_at ?? r.updated_at,
    url: r.html_url, homepage: r.homepage || null, topics: r.topics ?? [], fork: r.fork, archived: r.archived,
  }))
  writeCache(user, repos)
  return repos
}

export function rankRepos(repos: Repo[], featured: readonly string[]): Repo[] {
  const set = new Map(featured.map((n, i) => [n.toLowerCase(), i]))
  return [...repos].sort((a, b) => {
    const fa = set.get(a.name.toLowerCase()), fb = set.get(b.name.toLowerCase())
    if (fa !== undefined || fb !== undefined) return (fa ?? 999) - (fb ?? 999)
    return b.stars - a.stars || +new Date(b.updatedAt) - +new Date(a.updatedAt)
  })
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
