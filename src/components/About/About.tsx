import { profile, mindset, languages } from '../../data/profile'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section-pad relative bg-panel/40">
      <div className="container-x">
        <SectionHeading id="about-title" eyebrow="About me" title="My Developer Identity" />
        <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <figure className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-matrix/25">
              <img src="/images/developer.webp" srcSet="/images/developer-sm.webp 560w, /images/developer.webp 1000w" sizes="(min-width:1024px) 30vw, 24rem" loading="lazy"
                alt="Mosaic portrait of Rohith Katari smiling, built from small glossy tiles" width={800} height={1000} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-void/60 via-transparent to-transparent" aria-hidden="true" />
            </figure>
          </Reveal>
          <div>
            <Reveal>
              <h3 className="display text-2xl sm:text-3xl">{profile.name}</h3>
              <p className="mt-1 font-mono text-sm text-matrix">{profile.aboutTitle}</p>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-white/80">{profile.about.map((p) => <p key={p}>{p}</p>)}</div>
              <div className="mt-6">
                <p className="font-mono text-xs uppercase tracking-widest text-matrix">Languages I speak</p>
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Languages I speak">
                  {languages.map((l) => <li key={l} className="chip">{l}</li>)}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <h3 className="display text-xl sm:text-2xl">My Mindset: <span className="text-matrix">Think. Build. Break. Learn. Improve.</span></h3>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                {mindset.map((m, i) => (
                  <li key={m.word} className={`rounded-lg border border-matrix/15 bg-void/60 p-4 ${i === 4 ? 'sm:col-span-2' : ''}`}>
                    <p className="font-mono text-sm font-bold text-matrix">{m.word}</p>
                    <p className="mt-1 text-sm leading-relaxed text-mute">{m.text}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
