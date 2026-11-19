import { useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, Download, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react'
import { site, githubProfileUrl } from '../../config/site'
import { contactLimits as L } from '../../config/contact'
import { postJson } from '../../lib/api'
import { validateContact, type ContactErrors, type ContactInput } from '../../lib/validate'
import { GitHubIcon, LinkedInIcon } from '../ui/Icons'
import { Reveal } from '../ui/Reveal'

const empty: ContactInput = { name: '', email: '', company: '', subject: '', message: '' }
type Status = 'idle' | 'sending' | 'sent' | 'error'

export function Contact() {
  const [form, setForm] = useState<ContactInput>(empty)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState('')
  const [trap, setTrap] = useState('')
  const opened = useRef(Date.now())

  const set = (k: keyof ContactInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    const errs = validateContact(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0]
      document.getElementById(`c-${first}`)?.focus()
      return
    }
    setStatus('sending'); setServerError('')
    const res = await postJson<{ ok: true }>('/api/contact', { ...form, website: trap, elapsedMs: Date.now() - opened.current })
    if (res.ok) { setStatus('sent'); setForm(empty) }
    else { setStatus('error'); setServerError(res.error ?? 'Something went wrong.') }
  }

  const fieldErr = (k: keyof ContactInput) => errors[k] && <p id={`c-${k}-err`} className="mt-1.5 font-mono text-xs text-red-400">{errors[k]}</p>
  const aria = (k: keyof ContactInput) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `c-${k}-err` : undefined })

  return (
    <section id="contact" aria-labelledby="contact-title" className="section-pad relative overflow-hidden bg-panel/40">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" aria-hidden="true" />
      <div className="container-x relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="eyebrow mb-4">&gt;_ Contact</p>
          <h2 id="contact-title" className="display text-4xl sm:text-5xl md:text-6xl">Let&rsquo;s Connect. <span className="text-matrix">Let&rsquo;s Build.</span> Let&rsquo;s Innovate.</h2>
          <figure className="mt-8 flex items-center gap-4">
            <img src="/images/executive.webp" srcSet="/images/executive-sm.webp 560w, /images/executive.webp 1000w" sizes="7rem" loading="lazy" width={112} height={140}
              alt="Rohith Katari in a blazer, rendered as glowing green Matrix code" className="h-28 w-24 rounded-xl border border-matrix/30 object-cover object-top" />
            <figcaption><p className="font-semibold">{site.name}</p><p className="mt-1 flex items-center gap-1.5 text-sm text-mute"><MapPin className="h-4 w-4" aria-hidden="true" />{site.location}</p></figcaption>
          </figure>
          <ul className="mt-6 space-y-2 font-mono text-sm">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-matrix" aria-hidden="true" /><a className="break-all hover:text-matrix" href={`mailto:${site.email}`}>{site.email}</a></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-matrix" aria-hidden="true" /><a className="hover:text-matrix" href={site.phoneHref}>{site.phone}</a></li>
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={`mailto:${site.email}`} className="btn-primary"><Mail className="h-4 w-4" aria-hidden="true" />Email Me</a>
            <a href={githubProfileUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost"><GitHubIcon className="h-4 w-4" />View GitHub<span className="sr-only"> (opens in a new tab)</span></a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="btn-ghost"><LinkedInIcon className="h-4 w-4" />Connect on LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>
            <a href={site.resumeUrl} download className="btn-ghost"><Download className="h-4 w-4" aria-hidden="true" />Download Resume</a>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-matrix/25 bg-void/80 p-6 shadow-neon backdrop-blur sm:p-8">
            <h3 className="display text-2xl sm:text-3xl">Let&rsquo;s Build Something Great Together.</h3>
            <p className="mt-2 text-sm text-mute">Send me a message directly. It is stored securely and I get an email notification. <span className="text-white/60">Your details are used only to reply to you.</span></p>

            {status === 'sent' ? (
              <div role="status" className="mt-6 rounded-xl border border-matrix/40 bg-matrix/5 p-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-matrix" aria-hidden="true" />
                <p className="mt-3 font-semibold">Message sent. Thank you!</p>
                <p className="mt-1 text-sm text-mute">I will get back to you at the email address you provided.</p>
                <button type="button" className="btn-ghost mt-5" onClick={() => { setStatus('idle'); opened.current = Date.now() }}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="c-name" className="mb-1.5 block font-mono text-xs text-mute">Full Name *</label><input id="c-name" className="field" autoComplete="name" maxLength={L.name} value={form.name} onChange={set('name')} {...aria('name')} />{fieldErr('name')}</div>
                <div><label htmlFor="c-email" className="mb-1.5 block font-mono text-xs text-mute">Email Address *</label><input id="c-email" type="email" className="field" autoComplete="email" maxLength={L.email} value={form.email} onChange={set('email')} {...aria('email')} />{fieldErr('email')}</div>
                <div><label htmlFor="c-company" className="mb-1.5 block font-mono text-xs text-mute">Company / Organization</label><input id="c-company" className="field" autoComplete="organization" maxLength={L.company} value={form.company} onChange={set('company')} {...aria('company')} />{fieldErr('company')}</div>
                <div><label htmlFor="c-subject" className="mb-1.5 block font-mono text-xs text-mute">Subject *</label><input id="c-subject" className="field" maxLength={L.subject} value={form.subject} onChange={set('subject')} {...aria('subject')} />{fieldErr('subject')}</div>
                <div className="sm:col-span-2"><label htmlFor="c-message" className="mb-1.5 block font-mono text-xs text-mute">Message *</label><textarea id="c-message" rows={5} className="field resize-y" maxLength={L.message} value={form.message} onChange={set('message')} {...aria('message')} /><div className="flex justify-between">{fieldErr('message') || <span />}<span className="mt-1.5 font-mono text-[11px] text-mute">{form.message.length}/{L.message}</span></div></div>
                {/* Honeypot: hidden from people and assistive tech, bots fill it in. */}
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true"><label htmlFor="c-website">Website</label><input id="c-website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></div>
                <div className="sm:col-span-2">
                  {status === 'error' && <p role="alert" className="mb-3 rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">{serverError}</p>}
                  <button type="submit" disabled={status === 'sending'} className="btn-primary w-full sm:w-auto">
                    {status === 'sending' ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Sending…</> : <><Send className="h-4 w-4" aria-hidden="true" />Send Message</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
