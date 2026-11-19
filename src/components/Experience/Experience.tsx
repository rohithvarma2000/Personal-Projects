import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, MapPin } from 'lucide-react'
import { jobs } from '../../data/experience'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal, ease } from '../ui/Reveal'

export function Experience() {
  const [open, setOpen] = useState<string | null>(jobs[0].id)
  return (
    <section id="experience" aria-labelledby="exp-title" className="section-pad relative">
      <div className="container-x">
        <SectionHeading id="exp-title" eyebrow="Professional experience" title="Career Timeline" subtitle="Expand a role for the full list of responsibilities." />
        <ol className="relative ml-3 space-y-8 border-l border-matrix/25 pl-8 md:ml-6 md:pl-12">
          {jobs.map((j, i) => {
            const isOpen = open === j.id
            return (
              <li key={j.id} className="relative">
                <span className="absolute -left-[2.62rem] top-6 grid h-5 w-5 place-items-center rounded-full border-2 border-matrix bg-void shadow-neon md:-left-[3.62rem]" aria-hidden="true">
                  {i === 0 && <span className="h-1.5 w-1.5 rounded-full bg-matrix" />}
                </span>
                <Reveal>
                  <article className="rounded-xl border border-matrix/20 bg-panel/70 backdrop-blur">
                    <h3>
                      <button type="button" aria-expanded={isOpen} aria-controls={`job-${j.id}`} onClick={() => setOpen(isOpen ? null : j.id)}
                        className="flex w-full items-start justify-between gap-4 p-5 text-left sm:p-6">
                        <span className="min-w-0">
                          <span className="block font-mono text-xs text-matrix">{j.period}</span>
                          <span className="display mt-1 block text-2xl sm:text-3xl">{j.company}</span>
                          <span className="mt-1 block text-sm font-medium text-white/85">{j.role}</span>
                          {j.location && <span className="mt-1 flex items-center gap-1.5 text-xs text-mute"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{j.location}</span>}
                        </span>
                        <ChevronDown className={`mt-2 h-5 w-5 shrink-0 text-matrix transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                    </h3>
                    <div className="px-5 pb-5 sm:px-6">
                      <p className="text-sm leading-relaxed text-mute">{j.summary}</p>
                      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`${j.company} technologies`}>{j.tags.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
                    </div>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div id={`job-${j.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden">
                          <div className="border-t border-matrix/15 px-5 py-5 sm:px-6">
                            {j.scale && <p className="mb-5 rounded-lg border border-matrix/30 bg-matrix/5 p-4 text-sm leading-relaxed text-white/90">{j.scale}</p>}
                            <ul className="space-y-2.5">
                              {j.responsibilities.map((r) => (
                                <li key={r} className="flex gap-3 text-sm leading-relaxed text-white/80"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-matrix" aria-hidden="true" />{r}</li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </article>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
