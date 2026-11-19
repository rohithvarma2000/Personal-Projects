import { useMemo, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { site, githubProfileUrl } from '../../config/site'
import { useGitHub } from '../../hooks/useGitHub'
import { SectionHeading } from '../ui/SectionHeading'
import { GitHubIcon } from '../ui/Icons'
import { RepoCard } from './RepoCard'

const PAGE = 9
type Sort = 'featured' | 'latest'

export function GitHubSection() {
  const gh = useGitHub()
  const [q, setQ] = useState('')
  const [lang, setLang] = useState('all')
  const [sort, setSort] = useState<Sort>('featured')
  const [shown, setShown] = useState(PAGE)

  const languages = useMemo(() => Array.from(new Set(gh.repos.map((r) => r.language).filter((l): l is string => !!l))).sort(), [gh.repos])
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let out = gh.repos.filter((r) => (lang === 'all' || r.language === lang) && (!needle || `${r.name} ${r.description ?? ''} ${r.topics.join(' ')}`.toLowerCase().includes(needle)))
    if (sort === 'latest') out = [...out].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    return out
  }, [gh.repos, q, lang, sort])
  const featuredSet = new Set(site.featuredRepos.map((n) => n.toLowerCase()))

  return (
    <section id="github" aria-labelledby="gh-title" className="section-pad relative bg-panel/40">
      <div className="container-x">
        <SectionHeading id="gh-title" eyebrow="GitHub" title="My Open-Source Universe" subtitle="Live data from the GitHub public API, cached for 15 minutes." />

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <label htmlFor="repo-search" className="sr-only">Search repositories</label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" aria-hidden="true" />
            <input id="repo-search" type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE) }} placeholder="Search repositories" className="field pl-10" />
          </div>
          <label htmlFor="repo-lang" className="sr-only">Filter by language</label>
          <select id="repo-lang" value={lang} onChange={(e) => { setLang(e.target.value); setShown(PAGE) }} className="field md:w-52">
            <option value="all">All languages</option>
            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <div className="flex rounded-md border border-matrix/25 p-0.5" role="group" aria-label="Sort repositories">
            {(['featured', 'latest'] as const).map((s) => (
              <button key={s} type="button" aria-pressed={sort === s} onClick={() => setSort(s)} className={`rounded px-3 py-2 font-mono text-xs ${sort === s ? 'bg-matrix text-void' : 'text-mute hover:text-white'}`}>{s === 'featured' ? 'Featured' : 'Latest'}</button>
            ))}
          </div>
          <button type="button" onClick={gh.refresh} className="btn-ghost !px-3" aria-label="Refresh repositories"><RefreshCw className={`h-4 w-4 ${gh.status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" /></button>
          <a href={githubProfileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary"><GitHubIcon className="h-4 w-4" />View GitHub<span className="sr-only"> (opens in a new tab)</span></a>
        </div>

        {gh.stale && gh.error && <p role="status" className="mb-4 rounded-lg border border-matrix/30 bg-matrix/5 p-3 font-mono text-xs">Showing saved data. {gh.error.kind === 'rate-limit' ? `GitHub rate limit reached${gh.error.resetAt ? `, resets around ${gh.error.resetAt.toLocaleTimeString()}` : ''}.` : 'GitHub could not be reached just now.'}</p>}

        {gh.status === 'loading' && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading repositories">
            {Array.from({ length: 6 }).map((_, i) => <li key={i} className="h-44 animate-pulse rounded-xl border border-matrix/10 bg-panel" />)}
          </ul>
        )}

        {gh.status === 'error' && gh.error && (
          <div role="alert" className="rounded-xl border border-matrix/30 bg-panel p-6">
            <p className="font-mono text-sm text-matrix">
              {gh.error.kind === 'rate-limit' ? 'GitHub rate limit reached.' : gh.error.kind === 'not-found' ? 'GitHub user not found.' : 'Could not load repositories.'}
            </p>
            <p className="mt-2 text-sm text-mute">
              {gh.error.kind === 'rate-limit' && gh.error.resetAt ? `Unauthenticated requests reset around ${gh.error.resetAt.toLocaleTimeString()}. ` : ''}
              {gh.error.kind === 'not-found' ? 'Check VITE_GITHUB_USERNAME in your environment. ' : ''}You can still browse everything directly on GitHub.
            </p>
            <div className="mt-4 flex gap-3"><button type="button" className="btn-primary" onClick={gh.refresh}>Retry</button><a className="btn-ghost" href={githubProfileUrl} target="_blank" rel="noopener noreferrer">Open GitHub</a></div>
          </div>
        )}

        {gh.status === 'ready' && gh.repos.length === 0 && <p className="rounded-xl border border-matrix/20 bg-panel p-6 text-mute">No public repositories to show yet.</p>}
        {gh.status === 'ready' && gh.repos.length > 0 && list.length === 0 && <p className="rounded-xl border border-matrix/20 bg-panel p-6 text-mute">No repositories match your search.</p>}

        {gh.status === 'ready' && list.length > 0 && (
          <>
            <p className="mb-4 font-mono text-xs text-mute" role="status">{list.length} {list.length === 1 ? 'repository' : 'repositories'}</p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.slice(0, shown).map((r) => <li key={r.id}><RepoCard repo={r} featured={featuredSet.has(r.name.toLowerCase())} /></li>)}
            </ul>
            {shown < list.length && <div className="mt-8 text-center"><button type="button" className="btn-ghost" onClick={() => setShown((n) => n + PAGE)}>Show more</button></div>}
          </>
        )}
      </div>
    </section>
  )
}
