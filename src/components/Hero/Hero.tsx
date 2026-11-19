import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, Download, Mail } from 'lucide-react'
import { profile } from '../../data/profile'
import { site } from '../../config/site'
import { MatrixRain } from '../Matrix/MatrixRain'
import { Terminal } from '../Terminal/Terminal'
import { useParallax } from '../../animations/useParallax'
import { ease } from '../ui/Reveal'

function useTyped(text: string, start: boolean) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!start) return
    if (reduce) { setN(text.length); return }
    const t = window.setInterval(() => setN((v) => { if (v >= text.length) { window.clearInterval(t); return v } return v + 1 }), 45)
    return () => window.clearInterval(t)
  }, [start, text, reduce])
  return text.slice(0, n)
}

export function Hero({ ready }: { ready: boolean }) {
  const rain = useRef<HTMLDivElement>(null)
  useParallax(rain, 80)
  const typed = useTyped(profile.headline, ready)
  const done = typed.length === profile.headline.length

  return (
    <section id="home" aria-labelledby="hero-title" className="relative overflow-hidden px-5 pb-16 pt-28 sm:px-8 lg:px-14">
      {site.heroBackground && (
        <div className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${site.heroBackground})` }} aria-hidden="true" />
      )}
      <div ref={rain} className="pointer-events-none absolute inset-[-8%] opacity-45" aria-hidden="true"><MatrixRain /></div>
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(5,8,7,.15),rgba(5,8,7,.85)_70%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent" aria-hidden="true" />

      <div className="container-x relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <motion.p className="eyebrow mb-5" initial={{ opacity: 0, y: 12 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease }}>
              {profile.roles}
            </motion.p>
            <motion.h1 id="hero-title" className="display text-[clamp(3rem,10vw,7.5rem)]" initial={{ opacity: 0, y: 30 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, ease, delay: 0.1 }}>
              ROHITH <span className="text-matrix">KATARI</span>
            </motion.h1>
            <p className="mt-6 min-h-[3.2rem] max-w-2xl font-mono text-lg text-white sm:text-xl" aria-label={profile.headline}>
              <span aria-hidden="true">{typed}{!done && <span className="cursor-blink" />}</span>
            </p>
            <motion.p className="mt-4 max-w-xl text-base leading-relaxed text-mute sm:text-lg" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.6, duration: 0.8 }}>
              {profile.intro}
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.8, duration: 0.7, ease }}>
              <a href="#projects" className="btn-primary">Explore My Work <ArrowDown className="h-4 w-4" aria-hidden="true" /></a>
              <a href="#journey" className="btn-ghost">My Technical Journey</a>
              <a href={site.resumeUrl} download className="btn-ghost"><Download className="h-4 w-4" aria-hidden="true" /> Download Resume</a>
              <a href="#contact" className="btn-ghost"><Mail className="h-4 w-4" aria-hidden="true" /> Contact Me</a>
            </motion.div>
          </div>

          <motion.div className="mx-auto w-full max-w-[22rem] lg:max-w-none" initial={{ opacity: 0, scale: 0.95 }} animate={ready ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 1, ease, delay: 0.4 }}>
            <figure className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-matrix/30 shadow-neon scanlines">
              <img src="/images/cinematic.webp" srcSet="/images/cinematic-sm.webp 560w, /images/cinematic.webp 1000w" sizes="(min-width:1024px) 30vw, 22rem"
                alt="Side-angle portrait of Rohith Katari in glasses, with horizontal digital glitch streaks trailing behind his head" width={800} height={1000} fetchPriority="high" className="h-full w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void to-transparent p-4 font-mono text-xs text-matrix">$ whoami → rohith</figcaption>
            </figure>
          </motion.div>
        </div>

        <motion.div className="mx-auto mt-14 max-w-4xl" initial={{ opacity: 0, y: 24 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1, duration: 0.8, ease }}>
          <Terminal />
        </motion.div>
      </div>

      <a href="#about" aria-label="Scroll to About" className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 sm:block">
        <span className="flex h-9 w-5 justify-center rounded-full border border-matrix/50 pt-2"><span className="wheel h-2 w-0.5 rounded bg-matrix" /></span>
      </a>
    </section>
  )
}
