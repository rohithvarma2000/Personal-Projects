import { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink, Star } from 'lucide-react'
import { rows, type RowCard } from '../../data/rows'
import { labCategories } from '../../data/lab'
import { levels } from '../../data/journey'
import { githubProfileUrl } from '../../config/site'
import { useGitHub } from '../../hooks/useGitHub'
import { fmtDate } from '../../lib/github'
import { SectionHeading } from '../ui/SectionHeading'
import { Modal } from '../ui/Modal'

interface RowDef { id: string; title: string; subtitle: string; cards: RowCard[]; empty?: string }

function Row({ row, onOpen }: { row: RowDef; onOpen: (c: RowCard) => void }) {
  const track = useRef<HTMLUListElement>(null)
  const by = (d: 1 | -1) => track.current?.scrollBy({ left: d * Math.min(track.current.clientWidth * 0.8, 640), behavior: 'smooth' })
  return (
    <div className="mb-12">
      <div className="mb-4 flex items-end justify-between gap-4 px-5 sm:px-8 lg:px-0">
        <div>
          <h3 className="display text-2xl sm:text-3xl">{row.title}</h3>
          <p className="mt-1 text-sm text-mute">{row.subtitle}</p>
        </div>
        <div className="hidden gap-2 md:flex" role="group" aria-label={`Scroll ${row.title}`}>
          <button type="button" onClick={() => by(-1)} aria-label={`${row.title}: previous`} className="grid h-10 w-10 place-items-center rounded-full border border-matrix/30 hover:bg-matrix hover:text-void"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
          <button type="button" onClick={() => by(1)} aria-label={`${row.title}: next`} className="grid h-10 w-10 place-items-center rounded-full border border-matrix/30 hover:bg-matrix hover:text-void"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
        </div>
      </div>
      {row.cards.length === 0 ? (
        <p className="px-5 text-sm text-mute sm:px-8 lg:px-0">{row.empty}</p>
      ) : (
        <ul ref={track} className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-3 sm:px-8 lg:px-0" aria-label={row.title}>
          {row.cards.map((c) => (
            <li key={c.id} className="w-[76vw] shrink-0 snap-start sm:w-72">
              <button type="button" onClick={() => onOpen(c)} aria-label={`Open details: ${c.title}`}
                className="group flex h-full min-h-[13rem] w-full flex-col rounded-xl border border-matrix/20 bg-panel p-5 text-left transition duration-300 hover:-translate-y-1.5 hover:border-matrix/60 hover:shadow-neon focus-visible:-translate-y-1.5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-matrix">{c.tag}</span>
                <span className="mt-2 text-lg font-semibold leading-snug">{c.title}</span>
                <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-mute">{c.desc}</span>
                <span className="mt-auto flex flex-wrap gap-1.5 pt-4">{c.tech.slice(0, 3).map((t) => <span key={t} className="chip">{t}</span>)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Rows() {
  const gh = useGitHub()
  const [selected, setSelected] = useState<RowCard | null>(null)
  const close = useCallback(() => setSelected(null), [])

  const defs = useMemo<RowDef[]>(() => {
    const skills: RowDef = {
      id: 'skills', title: 'Technical Skills', subtitle: 'Open a category to see everything in it.',
      cards: labCategories.map((c) => ({ id: `s-${c.id}`, title: c.label, tag: `${c.skills.length} technologies`, desc: c.blurb, tech: c.skills.map((s) => s.name), details: c.skills.map((s) => s.name) })),
    }
    const journey: RowDef = {
      id: 'journey-row', title: 'My Professional Journey', subtitle: 'Verified milestones.',
      cards: levels.map((l) => ({ id: `j-${l.id}`, title: l.title, tag: `${l.level} · ${l.date}`, desc: l.text, tech: [l.org], details: [l.text] })),
    }
    const github: RowDef = {
      id: 'github-row', title: 'GitHub Projects', subtitle: 'Pulled live from my public GitHub repositories.',
      empty: gh.status === 'loading' ? 'Loading repositories…' : gh.status === 'error' ? 'Repositories are unavailable right now. Try again later or visit my GitHub profile.' : 'No public repositories yet.',
      cards: gh.repos.slice(0, 12).map((r) => ({
        id: `g-${r.id}`, title: r.name, tag: r.language ?? 'Repository', desc: r.description ?? 'No description provided.',
        tech: [r.language, ...r.topics].filter((x): x is string => !!x),
        details: [`★ ${r.stars} stars · ${r.forks} forks`, `Last updated ${fmtDate(r.updatedAt)}`],
        links: [{ label: 'View repository', href: r.url }, ...(r.homepage ? [{ label: 'Live demo', href: r.homepage.startsWith('http') ? r.homepage : `https://${r.homepage}` }] : [])],
      })),
    }
    return [...rows, skills, journey, github]
  }, [gh.repos, gh.status])

  return (
    <section id="discover" aria-labelledby="discover-title" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-14">
        <SectionHeading id="discover-title" eyebrow="Discover" title="Browse My Work" subtitle="Scroll each row, then open any card for details." />
        <div className="-mx-5 sm:-mx-8 lg:mx-0">{defs.map((r) => <Row key={r.id} row={r} onOpen={setSelected} />)}</div>
        <p className="font-mono text-xs text-mute">More on <a className="text-matrix underline" href={githubProfileUrl} target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
      </div>
      <AnimatePresence>
        {selected && (
          <Modal key={selected.id} titleId="card-title" onClose={close}>
            <div className="border-b border-matrix/15 px-6 pb-6 pt-14 sm:px-8">
              <p className="eyebrow">{selected.tag}</p>
              <h3 id="card-title" className="display mt-2 text-3xl sm:text-4xl">{selected.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{selected.desc}</p>
            </div>
            <div className="space-y-5 px-6 py-6 sm:px-8">
              {selected.note && <p className="rounded-lg border border-matrix/30 bg-matrix/5 p-3 text-sm">{selected.note}</p>}
              <ul className="space-y-2">{selected.details.map((d) => <li key={d} className="flex gap-3 text-sm text-white/80"><Star className="mt-1 h-3 w-3 shrink-0 text-matrix" aria-hidden="true" />{d}</li>)}</ul>
              <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">{selected.tech.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
              {selected.links && <div className="flex flex-wrap gap-3">{selected.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn-ghost">{l.label}<ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>)}</div>}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </section>
  )
}
