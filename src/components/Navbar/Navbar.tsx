import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { ArrowUp, Menu, X } from 'lucide-react'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useLockBody } from '../../hooks/useLockBody'

const links = [
  { id: 'home', label: 'Home' }, { id: 'about', label: 'About' }, { id: 'experience', label: 'Experience' },
  { id: 'lab', label: 'Developer Lab' }, { id: 'projects', label: 'Projects' }, { id: 'github', label: 'GitHub' },
  { id: 'education', label: 'Education' }, { id: 'contact', label: 'Contact' },
] as const
const ids = links.map((l) => l.id)

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useActiveSection(ids)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  useLockBody(open)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k)
  }, [open])

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${scrolled || open ? 'bg-void/85 backdrop-blur-xl' : 'bg-gradient-to-b from-void/80 to-transparent'}`}>
        <nav aria-label="Primary" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-14">
          <a href="#home" className="font-mono text-sm font-bold text-matrix" aria-label="Rohith Katari, back to top">
            <span className="text-matrix/60">&lt;</span>rk<span className="text-matrix/60">/&gt;</span>
          </a>
          <ul className="hidden items-center gap-5 xl:flex">
            {links.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} aria-current={active === l.id ? 'true' : undefined}
                  className={`font-mono text-xs transition-colors hover:text-matrix ${active === l.id ? 'text-matrix' : 'text-mute'}`}>{l.label}</a>
              </li>
            ))}
          </ul>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-md border border-matrix/25 xl:hidden" aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </nav>
        <motion.div className="h-0.5 origin-left bg-matrix shadow-neon" style={{ scaleX: progress }} aria-hidden="true" />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[66px] z-40 overflow-y-auto bg-void/95 px-5 py-8 backdrop-blur-xl xl:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ul>
              {links.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <a href={`#${l.id}`} onClick={() => setOpen(false)}
                    className={`display block border-b border-matrix/10 py-4 text-3xl ${active === l.id ? 'text-matrix' : 'text-white'}`}>{l.label}</a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900)
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.a href="#home" aria-label="Back to top" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-5 left-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-matrix/40 bg-void/80 text-matrix backdrop-blur hover:bg-matrix hover:text-void">
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </motion.a>
      )}
    </AnimatePresence>
  )
}
