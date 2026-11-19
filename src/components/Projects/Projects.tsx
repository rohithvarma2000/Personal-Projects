import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { useGitHub } from '../../hooks/useGitHub'
import { projectWriteups } from '../../data/projects'
import { fmtDate } from '../../lib/github'
import { githubProfileUrl } from '../../config/site'
import { SectionHeading } from '../ui/SectionHeading'
import { ease } from '../ui/Reveal'

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div><h4 className="eyebrow mb-2">{title}</h4><div className="text-sm leading-relaxed text-white/80">{children}</div></div>
)

export function Projects() {
  const gh = useGitHub()
  const [open, setOpen] = useState<number | null>(null)
  const top = gh.repos.slice(0, 6)

  return (
    <section id="projects" aria-labelledby="proj-title" className="section-pad relative">
      <div className="container-x">
        <SectionHeading id="proj-title" eyebrow="Projects" title="Technical Showcase" subtitle="My public GitHub projects, expanded. Professional and client work is described under Experience; it is confidential and not shown as a project here." />

        {gh.status === 'loading' && <p className="font-mono text-sm text-mute" aria-busy="true">Loading projects from GitHub…</p>}
        {gh.status === 'error' && <p role="alert" className="rounded-xl border border-matrix/30 bg-panel p-6 text-sm text-mute">Projects could not be loaded right now. <a className="text-matrix underline" href={githubProfileUrl} target="_blank" rel="noopener noreferrer">Browse them on GitHub</a>.</p>}
        {gh.status === 'ready' && top.length === 0 && <p className="rounded-xl border border-matrix/20 bg-panel p-6 text-sm text-mute">No public projects yet. New repositories will appear here automatically.</p>}

        <ul className="space-y-4">
          {top.map((r) => {
            const w = projectWriteups[r.name]
            const isOpen = open === r.id
            return (
              <li key={r.id} className="rounded-xl border border-matrix/20 bg-panel/70">
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`proj-${r.id}`} onClick={() => setOpen(isOpen ? null : r.id)} className="flex w-full items-start justify-between gap-4 p-5 text-left sm:p-6">
                    <span className="min-w-0">
                      <span className="block break-words font-mono text-lg font-semibold">{r.name}</span>
                      <span className="mt-1 block text-sm text-mute">{r.description ?? 'No description provided.'}</span>
                      <span className="mt-3 flex flex-wrap gap-1.5">{[r.language, ...(w?.tech ?? r.topics)].filter((x): x is string => !!x).map((t) => <span key={t} className="chip">{t}</span>)}</span>
                    </span>
                    <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-matrix transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`proj-${r.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
                      <div className="space-y-5 border-t border-matrix/15 p-5 sm:p-6">
                        {w ? (<>
                          <Block title="Problem statement"><p>{w.problem}</p></Block>
                          <Block title="Technical approach"><p>{w.approach}</p></Block>
                          <Block title="Key implementation details"><ul className="list-disc space-y-1 pl-5 marker:text-matrix">{w.details.map((d) => <li key={d}>{d}</li>)}</ul></Block>
                          {w.diagram && <img src={w.diagram} alt={`Architecture diagram for ${r.name}`} loading="lazy" className="max-w-full rounded-lg border border-matrix/20" />}
                        </>) : (
                          <p className="text-sm text-mute">A detailed write-up for this project is coming soon. The description, language and activity below come straight from GitHub.</p>
                        )}
                        {import.meta.env.DEV && !w && <p className="rounded border border-dashed border-yellow-400/50 bg-yellow-400/5 p-3 font-mono text-xs text-yellow-200">DEV ONLY placeholder: add an entry for “{r.name}” in src/data/projects.ts (problem, approach, details, diagram).</p>}
                        <p className="font-mono text-xs text-mute">★ {r.stars} · {r.forks} forks · updated {fmtDate(r.updatedAt)}</p>
                        <div className="flex flex-wrap gap-3">
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn-primary">GitHub repository<ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
                          {(w?.demo || r.homepage) && <a href={w?.demo ?? (r.homepage!.startsWith('http') ? r.homepage! : `https://${r.homepage}`)} target="_blank" rel="noopener noreferrer" className="btn-ghost">Live demo<ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
