import { useEffect, useRef } from 'react'

const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789<>{}[]/=+*'

/**
 * Digital rain on a single canvas. Capped at ~30fps and DPR 1.5, paused when the tab is hidden or the hero is
 * off-screen, lighter on small screens, and rendered once (static) under prefers-reduced-motion.
 */
export function MatrixRain({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, cols = 0, drops: number[] = [], size = 16
    let raf = 0, last = 0, visible = true, running = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      size = w < 640 ? 18 : 16
      cols = Math.ceil(w / size)
      drops = Array.from({ length: cols }, () => Math.random() * -40)
      ctx.fillStyle = '#050807'; ctx.fillRect(0, 0, w, h)
    }

    const step = (t: number) => {
      raf = requestAnimationFrame(step)
      if (t - last < 33) return
      last = t
      ctx.fillStyle = 'rgba(5,8,7,0.14)'; ctx.fillRect(0, 0, w, h)
      ctx.font = `${size}px "JetBrains Mono", monospace`
      for (let i = 0; i < cols; i++) {
        if (w < 640 && i % 2) continue
        const y = drops[i] * size
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0]
        ctx.fillStyle = Math.random() > 0.975 ? '#d8ffe3' : '#00FF41'
        ctx.fillText(ch, i * size, y)
        if (y > h && Math.random() > 0.975) drops[i] = 0
        drops[i] += 1
      }
    }
    const start = () => { if (!running && visible && !document.hidden && !reduce) { running = true; raf = requestAnimationFrame(step) } }
    const stop = () => { running = false; cancelAnimationFrame(raf) }

    resize()
    if (reduce) {
      // one static frame of rain
      ctx.font = `${size}px monospace`
      for (let i = 0; i < cols; i++) for (let j = 0; j < 14; j++) {
        ctx.fillStyle = `rgba(0,255,65,${0.08 + Math.random() * 0.35})`
        ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * size, Math.random() * h)
      }
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop() })
    io.observe(canvas)
    const onVis = () => (document.hidden ? stop() : start())
    const ro = new ResizeObserver(() => { resize() })
    ro.observe(canvas)
    document.addEventListener('visibilitychange', onVis)
    start()
    return () => { stop(); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  return <canvas ref={ref} className={`h-full w-full ${className}`} aria-hidden="true" />
}
