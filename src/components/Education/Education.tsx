import { Award, GraduationCap } from 'lucide-react'
import { certifications, education } from '../../data/profile'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'

export function Education() {
  return (
    <section id="education" aria-labelledby="edu-title" className="section-pad relative">
      <div className="container-x">
        <SectionHeading id="edu-title" eyebrow="Credentials" title="Education & Certification" />
        <div className="grid gap-5 lg:grid-cols-2">
          {education.map((e, i) => (
            <Reveal key={e.id} delay={i * 0.08}>
              <div className="h-full rounded-xl border border-matrix/20 bg-panel/70 p-6">
                <GraduationCap className="h-7 w-7 text-matrix" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold leading-snug">{e.degree}</h3>
                <p className="text-white/75">{e.school}</p>
                <p className="mt-1 font-mono text-xs text-mute">{e.period}</p>
              </div>
            </Reveal>
          ))}
          {certifications.map((c, i) => (
            <Reveal key={c.name} delay={0.16 + i * 0.08}>
              <div className="relative h-full overflow-hidden rounded-xl border border-matrix/40 bg-gradient-to-br from-matrix/10 via-panel to-void p-7 shadow-neon">
                <Award className="h-9 w-9 text-matrix" aria-hidden="true" />
                <p className="eyebrow mt-5">Certification</p>
                <h3 className="display mt-2 text-2xl sm:text-3xl">{c.name}</h3>
                <p className="mt-2 font-mono text-sm text-mute">{c.date}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
