import { useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useLockBody } from '../../hooks/useLockBody'
import { ease } from './Reveal'

/** Accessible dialog: Esc closes, focus is trapped and restored, body scroll locked. */
export function Modal({ titleId, onClose, children }: { titleId: string; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)
  useLockBody(true)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const items = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])') ?? [])
    items()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab') return
      const l = items(); if (!l.length) return
      const first = l[0], last = l[l.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); prev?.focus() }
  }, [onClose])

  return (
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="max-h-[92vh] w-full min-w-0 max-w-2xl overflow-y-auto rounded-t-2xl border border-matrix/25 bg-panel shadow-neon sm:rounded-2xl"
        initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} transition={{ duration: 0.4, ease }}>
        <div className="pointer-events-none sticky top-0 z-20 flex h-0 justify-end overflow-visible pr-4 pt-4">
          <button type="button" onClick={onClose} aria-label="Close details"
            className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-matrix hover:text-void">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}
