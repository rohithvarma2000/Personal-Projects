import { Reveal } from './Reveal'

export function SectionHeading({ eyebrow, title, subtitle, id }: { eyebrow: string; title: string; subtitle?: string; id?: string }) {
  return (
    <Reveal className="mb-12 max-w-3xl md:mb-14">
      <p className="eyebrow mb-4 flex items-center gap-3"><span className="text-matrix/60" aria-hidden="true">&gt;_</span>{eyebrow}</p>
      <h2 id={id} className="display break-words text-4xl sm:text-5xl md:text-6xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-mute md:text-lg">{subtitle}</p>}
    </Reveal>
  )
}
