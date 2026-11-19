import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { labCategories, kindLabel, type Skill } from '../../data/lab'
import { SectionHeading } from '../ui/SectionHeading'
import { DynamicIcon } from '../ui/Icons'
import { ease } from '../ui/Reveal'

const kindStyle: Record<Skill['kind'], string> = {
  experience: 'border-matrix/60 bg-matrix/10 text-matrix',
  toolkit: 'border-white/15 bg-white/5 text-white/80',
  learning: 'border-dashed border-matrix/40 bg-transparent text-matrix/80',
}

export function Lab() {
  const [catId, setCatId] = useState(labCategories[0].id)
  const [picked, setPicked] = useState<Skill | null>(labCategories[0].skills[0])
  const cat = labCategories.find((c) => c.id === catId) ?? labCategories[0]

  const choose = (id: string) => { setCatId(id); setPicked(labCategories.find((c) => c.id === id)!.skills[0]) }
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = labCategories[(i + d + labCategories.length) % labCategories.length]
    choose(n.id); document.getElementById(`lab-tab-${n.id}`)?.focus()
  }

  return (
    <section id="lab" aria-labelledby="lab-title" className="section-pad relative bg-panel/40">
      <div className="container-x">
        <SectionHeading id="lab-title" eyebrow="Developer lab" title="Inside My Developer Lab" subtitle="Click a technology to see how it relates to my experience. No proficiency scores: just honest labels." />
        <div className="mb-6 flex flex-wrap gap-3 font-mono text-xs text-mute" aria-label="Legend">
          {(Object.keys(kindLabel) as Skill['kind'][]).filter((k) => labCategories.some((c) => c.skills.some((s) => s.kind === k))).map((k) => <span key={k} className={`rounded border px-2 py-1 ${kindStyle[k]}`}>{kindLabel[k]}</span>)}
        </div>
        <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
          <div role="tablist" aria-label="Technology categories" aria-orientation="vertical" className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {labCategories.map((c, i) => {
              const on = c.id === catId
              return (
                <button key={c.id} id={`lab-tab-${c.id}`} role="tab" type="button" aria-selected={on} aria-controls="lab-panel" tabIndex={on ? 0 : -1}
                  onClick={() => choose(c.id)} onKeyDown={(e) => onKey(e, i)}
                  className={`flex shrink-0 items-center gap-3 rounded-lg border px-4 py-3 text-left font-mono text-xs transition ${on ? 'border-matrix bg-matrix/10 text-matrix shadow-neon' : 'border-matrix/15 text-mute hover:border-matrix/40 hover:text-white'}`}>
                  <DynamicIcon name={c.icon} className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap lg:whitespace-normal">{c.label}</span>
                </button>
              )
            })}
          </div>

          <div id="lab-panel" role="tabpanel" aria-labelledby={`lab-tab-${cat.id}`} className="min-w-0 rounded-xl border border-matrix/20 bg-void/70 p-5 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={cat.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease }}>
                <h3 className="display text-2xl sm:text-3xl">{cat.label}</h3>
                <p className="mb-6 mt-1 text-sm text-mute">{cat.blurb}</p>
                <ul className="flex flex-wrap gap-2.5">
                  {cat.skills.map((s) => {
                    const on = picked?.name === s.name
                    return (
                      <li key={s.name}>
                        <button type="button" onClick={() => setPicked(s)} aria-pressed={on}
                          className={`rounded-md border px-3.5 py-2 font-mono text-xs transition hover:-translate-y-0.5 hover:shadow-neon ${kindStyle[s.kind]} ${on ? 'ring-2 ring-matrix' : ''}`}>{s.name}</button>
                      </li>
                    )
                  })}
                </ul>
              </motion.div>
            </AnimatePresence>
            <div className="mt-7 rounded-lg border border-matrix/25 bg-panel p-5 font-mono text-sm" aria-live="polite">
              {picked ? (<>
                <p className="text-matrix">$ explain {picked.name.toLowerCase().replace(/\s+/g, '-')}</p>
                <p className="mt-2 text-xs text-mute">[{kindLabel[picked.kind]}]</p>
                <p className="mt-2 leading-relaxed text-white/85">{picked.note}</p>
              </>) : <p className="text-mute">Select a technology.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
