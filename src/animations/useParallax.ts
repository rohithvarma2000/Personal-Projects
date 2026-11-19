import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from './gsap'

/** Subtle GSAP ScrollTrigger parallax. Does nothing when reduced motion is requested. */
export function useParallax(ref: RefObject<HTMLElement | null>, distance = 80) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: distance,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement ?? el, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    })
    return () => ctx.revert()
  }, [ref, distance])
}
