import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Loader2, RotateCcw, Send, X } from 'lucide-react'
import { postJson } from '../../lib/api'

interface Msg { role: 'user' | 'assistant'; content: string }
const WELCOME = "Welcome to Rohith's digital workspace. I'm his AI portfolio assistant. Ask me about his experience, projects, technical skills, or professional background."
const SUGGEST = ['Who is Rohith?', 'What is his Spring Boot experience?', 'Has he worked with Angular or React?', 'What cloud technologies has he used?', 'How can I contact him?']
const MAX = 600

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [lastSent, setLastSent] = useState<Msg[] | null>(null)
  const log = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' }) }, [msgs, busy, error])
  useEffect(() => { if (open) input.current?.focus() }, [open])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k)
  }, [open])

  const send = async (history: Msg[]) => {
    setBusy(true); setError(''); setLastSent(history)
    const res = await postJson<{ reply: string }>('/api/chat', { messages: history })
    setBusy(false)
    if (res.ok && res.data?.reply) { setMsgs([...history, { role: 'assistant', content: res.data.reply }]); setLastSent(null) }
    else setError(res.error ?? 'The assistant is unavailable right now.')
  }

  const submit = (e?: FormEvent, preset?: string) => {
    e?.preventDefault()
    const content = (preset ?? text).trim()
    if (!content || busy) return
    const next = [...msgs, { role: 'user' as const, content: content.slice(0, MAX) }]
    setMsgs(next); setText(''); void send(next)
  }
  const reset = () => { setMsgs([]); setError(''); setLastSent(null); setText('') }

  return (
    <>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="ask-rohith"
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full border border-matrix/50 bg-void/90 px-4 py-3 font-mono text-sm font-semibold text-matrix shadow-neon backdrop-blur transition hover:bg-matrix hover:text-void">
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Bot className="h-5 w-5" aria-hidden="true" />}
        <span>{open ? 'Close' : 'Ask Rohith AI'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.section id="ask-rohith" aria-label="Ask Rohith AI" role="dialog" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }} transition={{ duration: 0.25 }}
            className="fixed inset-x-3 bottom-20 z-[60] flex max-h-[min(36rem,calc(100svh-6.5rem))] flex-col overflow-hidden rounded-2xl border border-matrix/40 bg-void shadow-neon sm:inset-x-auto sm:right-5 sm:w-[26rem]">
            <header className="flex items-center justify-between border-b border-matrix/20 bg-panel px-4 py-3">
              <div><p className="font-mono text-sm font-bold text-matrix">Ask Rohith AI</p><p className="text-[11px] text-mute">AI answers from his published portfolio info</p></div>
              <button type="button" onClick={reset} aria-label="Reset conversation" className="grid h-9 w-9 place-items-center rounded-md border border-matrix/25 hover:bg-matrix/10"><RotateCcw className="h-4 w-4" aria-hidden="true" /></button>
            </header>
            <div ref={log} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
              <p className="max-w-[90%] rounded-xl rounded-tl-sm bg-panel p-3 leading-relaxed text-white/90">{WELCOME}</p>
              {msgs.length === 0 && <div className="flex flex-wrap gap-2">{SUGGEST.map((s) => <button key={s} type="button" onClick={() => submit(undefined, s)} className="chip text-left transition hover:border-matrix hover:bg-matrix/15">{s}</button>)}</div>}
              {msgs.map((m, i) => (
                <p key={i} className={`max-w-[90%] whitespace-pre-wrap break-words rounded-xl p-3 leading-relaxed ${m.role === 'user' ? 'ml-auto rounded-tr-sm bg-matrix text-void' : 'rounded-tl-sm bg-panel text-white/90'}`}>{m.content}</p>
              ))}
              {busy && <p className="flex items-center gap-2 font-mono text-xs text-mute" role="status"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Thinking…</p>}
              {error && (
                <div role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-xs text-red-200">
                  {error}
                  {lastSent && <button type="button" onClick={() => void send(lastSent)} className="ml-2 font-semibold underline">Retry</button>}
                </div>
              )}
            </div>
            <form onSubmit={submit} className="border-t border-matrix/20 p-3">
              <div className="flex gap-2">
                <label htmlFor="chat-input" className="sr-only">Your question</label>
                <input id="chat-input" ref={input} value={text} maxLength={MAX} onChange={(e) => setText(e.target.value)} placeholder="Ask about Rohith…" autoComplete="off" className="field !py-2.5" />
                <button type="submit" disabled={busy || !text.trim()} aria-label="Send question" className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-matrix text-void disabled:opacity-40"><Send className="h-4 w-4" aria-hidden="true" /></button>
              </div>
              <p className="mt-2 text-[10px] leading-snug text-mute">Privacy: your messages are sent to an AI provider through my server to generate answers. They are not stored by this site. Don't share sensitive information.</p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
