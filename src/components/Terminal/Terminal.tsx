import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { site, githubProfileUrl } from '../../config/site'
import { profile } from '../../data/profile'
import { labCategories } from '../../data/lab'
import { levels } from '../../data/journey'
import { jobs } from '../../data/experience'
import { useGitHub } from '../../hooks/useGitHub'

interface Entry { id: number; cmd: string; out: ReactNode }

const COMMANDS = ['help', 'whoami', 'show-skills', 'view-projects', 'career-journey', 'contact', 'clear'] as const
const QUICK = ['whoami', 'show-skills', 'view-projects', 'career-journey', 'contact'] as const

const Line = ({ children }: { children: ReactNode }) => <p className="whitespace-pre-wrap break-words">{children}</p>
const Dim = ({ children }: { children: ReactNode }) => <span className="text-mute">{children}</span>

export function Terminal() {
  const reduce = useReducedMotion()
  const gh = useGitHub()
  const [entries, setEntries] = useState<Entry[]>([])
  const [value, setValue] = useState('')
  const [typing, setTyping] = useState('')
  const [booted, setBooted] = useState(false)
  const idRef = useRef(0)
  const histRef = useRef<string[]>([])
  const histIdx = useRef(-1)
  const scroller = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  const run = useCallback((raw: string): ReactNode => {
    const cmd = raw.trim().toLowerCase()
    switch (cmd) {
      case 'help':
        return <div><Line>Available commands:</Line>{COMMANDS.map((c) => <Line key={c}><span className="text-matrix">{c.padEnd(16)}</span></Line>)}<Dim>Tip: use ↑ / ↓ for history.</Dim></div>
      case 'whoami':
        return <div><Line><span className="text-matrix">{profile.name}</span> — {profile.aboutTitle}</Line><Line>{profile.about[0]}</Line><Line><Dim>Based in {profile.location}.</Dim></Line></div>
      case 'show-skills':
        return <div>{labCategories.map((c) => <Line key={c.id}><span className="text-matrix">{c.label}:</span> {c.skills.map((s) => s.name).join(', ')}</Line>)}<Dim>Open the Developer Lab section for details on each.</Dim></div>
      case 'view-projects': {
        const repos = gh.repos.slice(0, 6)
        return (
          <div>
            <Line><span className="text-matrix">Professional work</span></Line>
            {jobs.map((j) => <Line key={j.id}>• {j.company}: {j.summary}</Line>)}
            <Line><span className="text-matrix">GitHub ({site.githubUsername})</span></Line>
            {gh.status === 'loading' && <Dim>Loading repositories…</Dim>}
            {gh.status === 'error' && <Dim>Could not load repositories right now. {githubProfileUrl}</Dim>}
            {gh.status === 'ready' && repos.length === 0 && <Dim>No public repositories yet.</Dim>}
            {repos.map((r) => <Line key={r.id}>• <a className="text-matrix underline" href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a> <Dim>{r.language ?? ''} {r.description ? `— ${r.description}` : ''}</Dim></Line>)}
          </div>
        )
      }
      case 'career-journey':
        return <div>{levels.map((l) => <Line key={l.id}><span className="text-matrix">{l.level}</span> <Dim>{l.date}</Dim> {l.title} · {l.org}</Line>)}</div>
      case 'contact':
        return <div><Line>Email: <a className="text-matrix underline" href={`mailto:${site.email}`}>{site.email}</a></Line><Line>Phone: {site.phone}</Line><Line>Location: {site.location}</Line><Line>GitHub: <a className="text-matrix underline" href={githubProfileUrl} target="_blank" rel="noopener noreferrer">{githubProfileUrl}</a></Line><Line>LinkedIn: <a className="text-matrix underline" href={site.linkedin} target="_blank" rel="noopener noreferrer">{site.linkedin}</a></Line></div>
      default:
        return <Line><span className="text-red-400">command not found:</span> {raw} <Dim>(try "help")</Dim></Line>
    }
  }, [gh.repos, gh.status])

  const exec = useCallback((raw: string) => {
    const cmd = raw.trim()
    if (!cmd) return
    histRef.current.push(cmd); histIdx.current = -1
    if (cmd.toLowerCase() === 'clear') { setEntries([]); return }
    setEntries((e) => [...e, { id: idRef.current++, cmd, out: run(cmd) }])
  }, [run])

  // Boot: type "whoami" automatically so the terminal feels alive, then hand over control.
  useEffect(() => {
    if (reduce) { setEntries([{ id: idRef.current++, cmd: 'whoami', out: run('whoami') }]); setBooted(true); return }
    let i = 0
    const word = 'whoami'
    const t = window.setInterval(() => {
      i++; setTyping(word.slice(0, i))
      if (i === word.length) {
        window.clearInterval(t)
        window.setTimeout(() => { setTyping(''); setEntries([{ id: idRef.current++, cmd: word, out: run(word) }]); setBooted(true) }, 350)
      }
    }, 110)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight }) }, [entries, typing])

  const onSubmit = (e: FormEvent) => { e.preventDefault(); exec(value); setValue('') }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = histRef.current
    if (e.key === 'ArrowUp' && h.length) { e.preventDefault(); histIdx.current = Math.min(histIdx.current + 1, h.length - 1); setValue(h[h.length - 1 - histIdx.current]) }
    if (e.key === 'ArrowDown') { e.preventDefault(); histIdx.current = Math.max(histIdx.current - 1, -1); setValue(histIdx.current < 0 ? '' : h[h.length - 1 - histIdx.current]) }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-matrix/25 bg-void/90 shadow-neon backdrop-blur" onClick={() => input.current?.focus()}>
      <div className="flex items-center gap-2 border-b border-matrix/15 bg-panel px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-red-500/70" aria-hidden="true" /><span className="h-3 w-3 rounded-full bg-yellow-400/70" aria-hidden="true" /><span className="h-3 w-3 rounded-full bg-matrix/70" aria-hidden="true" />
        <span className="ml-3 truncate font-mono text-xs text-mute">rohith@portfolio: ~</span>
      </div>
      <div ref={scroller} className="h-64 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed text-white/85 sm:h-72" role="log" aria-live="polite" aria-label="Terminal output">
        {entries.map((e) => (
          <div key={e.id} className="mb-3">
            <p><span className="text-matrix">$</span> {e.cmd}</p>
            <div className="mt-1 space-y-1">{e.out}</div>
          </div>
        ))}
        {!booted && <p><span className="text-matrix">$</span> {typing}<span className="cursor-blink" /></p>}
        {booted && (
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <label htmlFor="term-input" className="text-matrix">$</label>
            <input id="term-input" ref={input} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKey}
              autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder='type "help"'
              className="min-w-0 flex-1 bg-transparent text-white placeholder:text-mute/50 focus:outline-none" />
          </form>
        )}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-matrix/15 bg-panel/60 px-3 py-2.5" role="group" aria-label="Quick commands">
        {QUICK.map((c) => (
          <button key={c} type="button" disabled={!booted} onClick={() => exec(c)} className="chip transition hover:border-matrix hover:bg-matrix/15 disabled:opacity-40">{c}</button>
        ))}
        <button type="button" disabled={!booted} onClick={() => setEntries([])} className="chip transition hover:border-matrix disabled:opacity-40">clear</button>
      </div>
    </div>
  )
}
