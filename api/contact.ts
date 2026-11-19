import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clean, clientIp, guard, hashIp, json } from './_lib/http.js'
import { rateLimit } from './_lib/ratelimit.js'
import { countRecentByIp, insertMessage, supabaseConfig } from './_lib/supabase.js'
import { validateContact } from '../src/lib/validate.js'
import { contactLimits as L } from '../src/config/contact.js'

const MIN_FILL_MS = 2500        // humans take longer than this to fill a form
const PER_HOUR_DB = 5            // persistent cap per hashed IP

async function notify(m: { name: string; email: string; company: string; subject: string; message: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY, to = process.env.NOTIFY_TO_EMAIL, from = process.env.NOTIFY_FROM_EMAIL
  if (!key || !to || !from) return false
  const text = [`New portfolio message`, ``, `From: ${m.name} <${m.email}>`, `Company: ${m.company || '—'}`, `Subject: ${m.subject}`, ``, m.message].join('\n')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    // Plain text only (no HTML) so visitor input can never inject markup into the notification.
    body: JSON.stringify({ from, to: [to], reply_to: m.email, subject: `Portfolio: ${m.subject}`.replace(/[\r\n]+/g, ' ').slice(0, 200), text }),
  })
  return res.ok
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (guard(req, res, 20_000)) return
  if (!supabaseConfig()) return json(res, 503, { error: 'Messaging is not configured on the server yet. Please email me directly.' })

  const body = req.body as Record<string, unknown>
  const ip = clientIp(req), ipHash = hashIp(ip)

  const rl = rateLimit(`contact:${ipHash}`, 5, 10 * 60_000)
  if (!rl.ok) { res.setHeader('Retry-After', String(rl.retryAfterSec)); return json(res, 429, { error: 'Too many messages. Please try again later.' }) }

  // Spam traps: pretend success so bots learn nothing, store nothing.
  const elapsed = Number(body.elapsedMs)
  if (clean(body.website, 200) !== '' || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return json(res, 200, { ok: true })

  const input = {
    name: clean(body.name, L.name + 1), email: clean(body.email, L.email + 1), company: clean(body.company, L.company + 1),
    subject: clean(body.subject, L.subject + 1), message: clean(body.message, L.message + 1),
  }
  const errors = validateContact(input)
  if (Object.keys(errors).length) return json(res, 400, { error: Object.values(errors)[0], fields: errors })
  if ((input.message.match(/https?:\/\//gi) ?? []).length > 3) return json(res, 400, { error: 'Please remove some links from your message.' })

  try {
    const recent = await countRecentByIp(ipHash, new Date(Date.now() - 3600_000).toISOString())
    if (recent >= PER_HOUR_DB) return json(res, 429, { error: 'Too many messages. Please try again later.' })
    await insertMessage({ ...input, company: input.company || null, ip_hash: ipHash, user_agent: clean(req.headers['user-agent'], 300) })
  } catch (e) {
    console.error('contact: store failed', (e as Error).message)
    return json(res, 502, { error: 'Your message could not be saved. Please try again or email me directly.' })
  }

  let notified = false
  try { notified = await notify(input) } catch (e) { console.error('contact: email failed', (e as Error).message) }
  if (!notified) console.error('contact: message stored but email notification was not sent')
  return json(res, 200, { ok: true, notified })
}
