import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { Loader2, LogOut, Mail, MailOpen, Search, Trash2 } from 'lucide-react'
import { site } from '../../config/site'

type FollowUp = 'none' | 'pending' | 'replied' | 'done'
interface Message { id: string; created_at: string; name: string; email: string; company: string | null; subject: string; message: string; read: boolean; follow_up: FollowUp; notes: string | null }
type Filter = 'all' | 'unread' | 'follow-up'

let clientPromise: Promise<SupabaseClient> | null = null
function getClient() {
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(site.supabaseUrl, site.supabaseAnonKey))
  return clientPromise
}

const when = (iso: string) => new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

export default function AdminApp() {
  const [client, setClient] = useState<SupabaseClient | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [booting, setBooting] = useState(true)
  const configured = !!site.supabaseUrl && !!site.supabaseAnonKey

  useEffect(() => {
    document.title = 'Admin | Rohith Katari'
    const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex,nofollow'; document.head.appendChild(meta)
    return () => { meta.remove() }
  }, [])

  useEffect(() => {
    if (!configured) { setBooting(false); return }
    let sub: { unsubscribe: () => void } | undefined
    void getClient().then(async (c) => {
      setClient(c)
      const { data } = await c.auth.getSession()
      setSession(data.session); setBooting(false)
      sub = c.auth.onAuthStateChange((_e, s) => setSession(s)).data.subscription
    })
    return () => sub?.unsubscribe()
  }, [configured])

  useEffect(() => {
    if (!client || !session) { setAuthorized(null); return }
    // Authorization is enforced by Postgres RLS; this call just lets the UI show a clear message.
    void client.rpc('is_admin').then(({ data, error }) => setAuthorized(!error && data === true))
  }, [client, session])

  return (
    <div className="min-h-screen bg-void px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <h1 className="display text-2xl sm:text-3xl">Message <span className="text-matrix">Dashboard</span></h1>
          <div className="flex items-center gap-3">
            <a href="/" className="font-mono text-xs text-mute hover:text-matrix">← Portfolio</a>
            {session && client && <button type="button" onClick={() => void client.auth.signOut()} className="btn-ghost !px-3 !py-2 text-xs"><LogOut className="h-4 w-4" aria-hidden="true" />Sign out</button>}
          </div>
        </header>

        {!configured && <p role="alert" className="rounded-xl border border-matrix/30 bg-panel p-6 text-sm text-mute">Supabase is not configured. Set <code className="text-matrix">VITE_SUPABASE_URL</code> and <code className="text-matrix">VITE_SUPABASE_ANON_KEY</code> (see README).</p>}
        {configured && booting && <p className="flex items-center gap-2 font-mono text-sm text-mute"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Loading…</p>}
        {configured && !booting && !session && client && <Login client={client} />}
        {session && authorized === null && <p className="flex items-center gap-2 font-mono text-sm text-mute"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Checking access…</p>}
        {session && authorized === false && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 p-6 text-sm text-red-200">This account is not authorized to view messages. Sign out and use the owner account.</p>}
        {session && authorized && client && <Dashboard client={client} />}
      </div>
    </div>
  )
}

function Login({ client }: { client: SupabaseClient }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false); if (error) setErr('Sign-in failed. Check your email and password.')
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-2xl border border-matrix/25 bg-panel p-6 shadow-neon">
      <h2 className="display text-xl">Owner sign-in</h2>
      <div><label htmlFor="a-email" className="mb-1.5 block font-mono text-xs text-mute">Email</label><input id="a-email" type="email" autoComplete="username" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><label htmlFor="a-pass" className="mb-1.5 block font-mono text-xs text-mute">Password</label><input id="a-pass" type="password" autoComplete="current-password" required className="field" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}

function Dashboard({ client }: { client: SupabaseClient }) {
  const [rows, setRows] = useState<Message[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const [selId, setSelId] = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState(false)
  const [note, setNote] = useState('')
  const [saveErr, setSaveErr] = useState('')

  const load = useCallback(async () => {
    setState('loading')
    const { data, error } = await client.from('messages').select('*').order('created_at', { ascending: false })
    if (error) { setState('error'); return }
    setRows(data as Message[]); setState('ready')
  }, [client])
  useEffect(() => { void load() }, [load])

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter((m) =>
      (filter === 'all' || (filter === 'unread' ? !m.read : m.follow_up === 'pending')) &&
      (!needle || `${m.name} ${m.email} ${m.company ?? ''} ${m.subject} ${m.message}`.toLowerCase().includes(needle)))
  }, [rows, filter, q])
  const sel = rows.find((m) => m.id === selId) ?? null
  useEffect(() => { setNote(sel?.notes ?? ''); setConfirmDel(false); setSaveErr('') }, [selId]) // eslint-disable-line react-hooks/exhaustive-deps

  const patch = async (id: string, change: Partial<Pick<Message, 'read' | 'follow_up' | 'notes'>>) => {
    setSaveErr('')
    const { error } = await client.from('messages').update(change).eq('id', id)
    if (error) { setSaveErr('Could not save the change.'); return }
    setRows((r) => r.map((m) => (m.id === id ? { ...m, ...change } : m)))
  }
  const open = (m: Message) => { setSelId(m.id); if (!m.read) void patch(m.id, { read: true }) }
  const remove = async (id: string) => {
    const { error } = await client.from('messages').delete().eq('id', id)
    if (error) { setSaveErr('Could not delete the message.'); return }
    setRows((r) => r.filter((m) => m.id !== id)); setSelId(null)
  }
  const unread = rows.filter((m) => !m.read).length

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filter messages">
          {(['all', 'unread', 'follow-up'] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`rounded-md border px-3 py-1.5 font-mono text-xs ${filter === f ? 'border-matrix bg-matrix text-void' : 'border-matrix/25 text-mute'}`}>{f === 'unread' ? `unread (${unread})` : f}</button>
          ))}
        </div>
        <div className="relative mb-3"><label htmlFor="a-search" className="sr-only">Search messages</label><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" aria-hidden="true" /><input id="a-search" className="field pl-9" placeholder="Search messages" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {state === 'loading' && <p className="font-mono text-sm text-mute">Loading messages…</p>}
        {state === 'error' && <p role="alert" className="text-sm text-red-300">Could not load messages. <button type="button" className="underline" onClick={() => void load()}>Retry</button></p>}
        {state === 'ready' && visible.length === 0 && <p className="rounded-lg border border-matrix/15 p-4 text-sm text-mute">{rows.length === 0 ? 'No messages yet.' : 'No messages match.'}</p>}
        <ul className="space-y-2">
          {visible.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => open(m)} aria-current={m.id === selId} className={`w-full rounded-lg border p-3 text-left transition ${m.id === selId ? 'border-matrix bg-matrix/10' : 'border-matrix/15 bg-panel hover:border-matrix/40'}`}>
                <span className="flex items-center gap-2 text-sm">{m.read ? <MailOpen className="h-4 w-4 text-mute" aria-hidden="true" /> : <Mail className="h-4 w-4 text-matrix" aria-hidden="true" />}<span className={`truncate ${m.read ? 'text-white/80' : 'font-semibold'}`}>{m.name}</span>{!m.read && <span className="sr-only">(unread)</span>}</span>
                <span className="mt-1 block truncate text-xs text-white/70">{m.subject}</span>
                <span className="mt-1 flex items-center justify-between font-mono text-[11px] text-mute"><span>{when(m.created_at)}</span>{m.follow_up !== 'none' && <span className="text-matrix">{m.follow_up}</span>}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="min-w-0 rounded-2xl border border-matrix/20 bg-panel p-5 sm:p-7">
        {!sel ? <p className="text-sm text-mute">Select a message to read it.</p> : (
          <article>
            <h2 className="display break-words text-2xl">{sel.subject}</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-2 font-mono text-xs sm:grid-cols-2">
              <div><dt className="text-mute">From</dt><dd className="break-words">{sel.name}</dd></div>
              <div><dt className="text-mute">Email</dt><dd><a className="break-all text-matrix hover:underline" href={`mailto:${sel.email}`}>{sel.email}</a></dd></div>
              <div><dt className="text-mute">Company</dt><dd className="break-words">{sel.company || '—'}</dd></div>
              <div><dt className="text-mute">Received</dt><dd>{when(sel.created_at)}</dd></div>
            </dl>
            <p className="mt-5 whitespace-pre-wrap break-words rounded-lg border border-matrix/15 bg-void/70 p-4 text-sm leading-relaxed">{sel.message}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="a-follow" className="mb-1.5 block font-mono text-xs text-mute">Follow-up status</label>
                <select id="a-follow" className="field" value={sel.follow_up} onChange={(e) => void patch(sel.id, { follow_up: e.target.value as FollowUp })}>
                  <option value="none">None</option><option value="pending">Pending</option><option value="replied">Replied</option><option value="done">Done</option>
                </select></div>
              <div className="flex items-end"><button type="button" className="btn-ghost w-full" onClick={() => void patch(sel.id, { read: !sel.read })}>{sel.read ? 'Mark as unread' : 'Mark as read'}</button></div>
            </div>
            <div className="mt-4"><label htmlFor="a-notes" className="mb-1.5 block font-mono text-xs text-mute">Private notes</label>
              <textarea id="a-notes" rows={3} className="field" value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => note !== (sel.notes ?? '') && void patch(sel.id, { notes: note })} /></div>
            {saveErr && <p role="alert" className="mt-3 text-sm text-red-300">{saveErr}</p>}

            <div className="mt-6 border-t border-matrix/15 pt-5">
              {!confirmDel ? <button type="button" className="inline-flex items-center gap-2 font-mono text-xs text-red-300 hover:underline" onClick={() => setConfirmDel(true)}><Trash2 className="h-4 w-4" aria-hidden="true" />Delete message</button> : (
                <div className="flex flex-wrap items-center gap-3"><span className="text-sm">Delete this message permanently?</span>
                  <button type="button" className="rounded-md bg-red-500 px-3 py-1.5 font-mono text-xs font-semibold text-white" onClick={() => void remove(sel.id)}>Yes, delete</button>
                  <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => setConfirmDel(false)}>Cancel</button></div>
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  )
}
