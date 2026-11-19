import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { levels } from '../../data/journey'
import { SectionHeading } from '../ui/SectionHeading'
import { ease } from '../ui/Reveal'

export function Journey() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const grow = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  return (
    <section id="journey" aria-labelledby="journey-title" className="section-pad relative bg-panel/40">
      <div className="container-x">
        <SectionHeading id="journey-title" eyebrow="Technical journey" title="Level Progression" subtitle="Verified milestones from my resume, played as levels." />
        <ol ref={ref} className="relative mx-auto max-w-4xl">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-matrix/15 md:left-1/2" aria-hidden="true" />
          <motion.div className="absolute bottom-0 left-4 top-0 w-px origin-top bg-matrix shadow-neon md:left-1/2" style={{ scaleY: grow }} aria-hidden="true" />
          {levels.map((l, i) => {
            const left = i % 2 === 0
            const last = i === levels.length - 1
            return (
              <motion.li key={l.id} initial={{ opacity: 0, x: left ? -24 : 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, ease }}
                className={`relative mb-10 pl-12 md:w-1/2 md:pl-0 ${left ? 'md:pr-12 md:text-right' : 'md:ml-[50%] md:pl-12'}`}>
                <span className={`absolute left-0 top-1 grid h-9 w-9 place-items-center rounded-full border-2 bg-void font-mono text-[10px] font-bold ${last ? 'border-dashed border-matrix text-matrix' : 'border-matrix text-matrix shadow-neon'} ${left ? 'md:left-auto md:-right-[18px]' : 'md:-left-[18px]'}`} aria-hidden="true">
                  {last ? '→' : i + 1}
                </span>
                <div className={`rounded-xl border p-5 ${last ? 'border-dashed border-matrix/40' : 'border-matrix/20'} bg-panel/70`}>
                  <p className="font-mono text-xs text-matrix">{l.level} · {l.date}</p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug">{l.title}</h3>
                  <p className="text-sm text-mute">{l.org}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{l.text}</p>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
