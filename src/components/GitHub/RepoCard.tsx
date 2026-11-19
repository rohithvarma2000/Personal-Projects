import { ExternalLink, GitFork, Star } from 'lucide-react'
import type { Repo } from '../../lib/github'
import { fmtDate } from '../../lib/github'

export function RepoCard({ repo, featured }: { repo: Repo; featured?: boolean }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-matrix/20 bg-panel p-5 transition duration-300 hover:-translate-y-1 hover:border-matrix/60 hover:shadow-neon focus-within:border-matrix/60">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words font-mono text-base font-semibold text-white">{repo.name}</h3>
        {featured && <span className="chip shrink-0">Featured</span>}
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-mute">{repo.description ?? 'No description provided.'}</p>
      <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-mute">
        {repo.language && <div className="flex items-center gap-1.5"><dt className="sr-only">Language</dt><dd className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-matrix" aria-hidden="true" />{repo.language}</dd></div>}
        <div className="flex items-center gap-1"><dt className="sr-only">Stars</dt><dd className="flex items-center gap-1"><Star className="h-3.5 w-3.5" aria-hidden="true" />{repo.stars}</dd></div>
        <div className="flex items-center gap-1"><dt className="sr-only">Forks</dt><dd className="flex items-center gap-1"><GitFork className="h-3.5 w-3.5" aria-hidden="true" />{repo.forks}</dd></div>
        <div><dt className="sr-only">Last updated</dt><dd>Updated {fmtDate(repo.updatedAt)}</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-mono text-matrix hover:underline">Repository<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> {repo.name} (opens in a new tab)</span></a>
        {repo.homepage && <a href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-mono text-matrix hover:underline">Live demo<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> for {repo.name} (opens in a new tab)</span></a>}
      </div>
    </article>
  )
}
