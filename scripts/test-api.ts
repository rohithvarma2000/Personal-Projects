/* API behaviour tests with mocked Supabase / Resend / AI / GitHub. Run: npm run test:api
   These verify OUR logic (validation, spam, rate limits, auth of origin, request shaping).
   They do not talk to live services. */
import contact from '../api/contact.js'
import chat from '../api/chat.js'
import { _resetRateLimits } from '../api/_lib/ratelimit.js'
import { _resetKnowledgeCache } from '../api/_lib/knowledge.js'

type Call = { url: string; init: RequestInit }
let calls: Call[] = []
let handlers: Array<(url: string, init: RequestInit) => Response | undefined> = []
globalThis.fetch = (async (url: string | URL | Request, init: RequestInit = {}) => {
  const u = String(url); calls.push({ url: u, init })
  for (const h of handlers) { const r = h(u, init); if (r) return r }
  return new Response('{}', { status: 200 })
}) as typeof fetch

const ok = (b: unknown = {}, headers: Record<string, string> = {}) => new Response(JSON.stringify(b), { status: 200, headers })
function mockServices(over: { dbCount?: string; dbInsertStatus?: number; emailStatus?: number; ghFail?: boolean; ai?: (u: string, i: RequestInit) => Response } = {}) {
  handlers = [
    (u, i) => u.includes('/rest/v1/messages') && i.method === 'POST' ? new Response('', { status: over.dbInsertStatus ?? 201 }) : undefined,
    (u) => u.includes('/rest/v1/messages') ? new Response('[]', { status: 200, headers: { 'content-range': `0-0/${over.dbCount ?? '0'}` } }) : undefined,
    (u) => u.includes('api.resend.com') ? new Response('{}', { status: over.emailStatus ?? 200 }) : undefined,
    (u) => u.includes('api.github.com') ? (over.ghFail ? new Response('', { status: 403 }) : ok([{ name: 'demo-repo', description: 'A demo', language: 'Java', stargazers_count: 3, html_url: 'https://github.com/rohithvarma2000/demo-repo', fork: false }, { name: 'forked', description: null, language: null, stargazers_count: 0, html_url: 'x', fork: true }])) : undefined,
    (u, i) => (u.includes('anthropic.com') || u.includes('openai')) ? (over.ai ? over.ai(u, i) : ok({ content: [{ type: 'text', text: 'Hello from the model.' }], choices: [{ message: { content: 'Hello from openai.' } }] })) : undefined,
  ]
  calls = []
}

function run(handler: (req: never, res: never) => Promise<unknown>, body: unknown, opts: { method?: string; origin?: string | null; ip?: string } = {}) {
  const headers: Record<string, string> = { host: 'site.test', 'x-forwarded-for': opts.ip ?? '1.2.3.4', 'user-agent': 'test', 'content-length': String(JSON.stringify(body ?? {}).length) }
  if (opts.origin !== null) headers.origin = opts.origin ?? 'https://site.test'
  const req = { method: opts.method ?? 'POST', headers, body, socket: {} }
  const out: { status: number; body: any; headers: Record<string, string> } = { status: 0, body: null, headers: {} }
  const res = { setHeader: (k: string, v: string) => { out.headers[k] = v }, status(c: number) { out.status = c; return this }, json(b: unknown) { out.body = b; return this } }
  return handler(req as never, res as never).then(() => out)
}

let pass = 0, fail = 0
function t(name: string, cond: boolean, extra = '') { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ← ' + extra}`) }

const good = { name: 'Ada Lovelace', email: 'ada@example.com', company: 'Analytical Engines', subject: 'Hello', message: 'I would like to talk about a role.', website: '', elapsedMs: 9000 }
const env = (o: Record<string, string | undefined>) => { for (const [k, v] of Object.entries(o)) v === undefined ? delete process.env[k] : (process.env[k] = v) }
const full = { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srv', RESEND_API_KEY: 're', NOTIFY_TO_EMAIL: 'me@x.com', NOTIFY_FROM_EMAIL: 'Portfolio <n@x.com>', IP_HASH_SALT: 's', AI_API_KEY: 'k', AI_PROVIDER: 'anthropic', AI_MODEL: undefined, ALLOWED_ORIGINS: undefined, GITHUB_USERNAME: undefined } as const

async function main() {
  // ───── contact ─────
  env(full); _resetRateLimits(); mockServices()
  let r = await run(contact as never, good)
  t('contact: valid → 200 ok + notified', r.status === 200 && r.body.ok === true && r.body.notified === true, JSON.stringify(r))
  const ins = calls.find((c) => c.url.includes('/rest/v1/messages') && c.init.method === 'POST')
  const row = ins ? JSON.parse(String(ins.init.body)) : {}
  t('contact: stored with service-role auth header', (ins?.init.headers as Record<string, string>)?.Authorization === 'Bearer srv')
  t('contact: stores hashed IP, never raw IP', typeof row.ip_hash === 'string' && !JSON.stringify(row).includes('1.2.3.4'))
  const mail = JSON.parse(String(calls.find((c) => c.url.includes('resend'))?.init.body ?? '{}'))
  t('contact: email is plain text with reply_to', mail.reply_to === 'ada@example.com' && !('html' in mail) && mail.to[0] === 'me@x.com')

  _resetRateLimits(); mockServices()
  r = await run(contact as never, { ...good, subject: 'Hi\r\nBcc: evil@x.com' })
  const m2 = JSON.parse(String(calls.find((c) => c.url.includes('resend'))?.init.body ?? '{}'))
  t('contact: header injection stripped from subject', !/[\r\n]/.test(m2.subject ?? 'x'), m2.subject)

  mockServices(); r = await run(contact as never, { ...good, website: 'http://spam' }, { ip: '9.9.9.9' })
  t('contact: honeypot → silent 200, nothing stored', r.status === 200 && !calls.some((c) => c.url.includes('/rest/v1')))
  mockServices(); r = await run(contact as never, { ...good, elapsedMs: 300 }, { ip: '9.9.9.8' })
  t('contact: instant submit → silent 200, nothing stored', r.status === 200 && !calls.some((c) => c.url.includes('/rest/v1')))
  mockServices(); r = await run(contact as never, { ...good, email: 'nope' }, { ip: '9.9.9.7' })
  t('contact: invalid email → 400', r.status === 400 && /email/i.test(r.body.error))
  mockServices(); r = await run(contact as never, { ...good, message: 'short' }, { ip: '9.9.9.6' })
  t('contact: short message → 400', r.status === 400)
  mockServices(); r = await run(contact as never, { ...good, message: 'x https://a.co https://b.co https://c.co https://d.co more' }, { ip: '9.9.9.5' })
  t('contact: link-stuffing → 400', r.status === 400)
  mockServices(); r = await run(contact as never, good, { origin: 'https://evil.test', ip: '9.9.9.4' })
  t('contact: foreign Origin → 403', r.status === 403)
  mockServices(); r = await run(contact as never, good, { origin: null, ip: '9.9.9.3' })
  t('contact: missing Origin → 403', r.status === 403)
  mockServices(); r = await run(contact as never, good, { method: 'GET', ip: '9.9.9.2' })
  t('contact: GET → 405', r.status === 405)
  env({ ALLOWED_ORIGINS: 'https://myportfolio.com' }); mockServices(); r = await run(contact as never, good, { origin: 'https://myportfolio.com', ip: '9.9.9.1' })
  t('contact: ALLOWED_ORIGINS honoured', r.status === 200); env({ ALLOWED_ORIGINS: undefined })

  _resetRateLimits(); mockServices()
  let last = 0
  for (let i = 0; i < 6; i++) last = (await run(contact as never, good, { ip: '5.5.5.5' })).status
  t('contact: in-memory rate limit → 429 on 6th', last === 429)
  _resetRateLimits(); mockServices({ dbCount: '5' }); r = await run(contact as never, good, { ip: '5.5.5.6' })
  t('contact: persistent DB rate limit → 429', r.status === 429)
  _resetRateLimits(); mockServices({ dbInsertStatus: 500 }); r = await run(contact as never, good, { ip: '5.5.5.7' })
  t('contact: DB failure → 502 (not a fake success)', r.status === 502)
  _resetRateLimits(); mockServices({ emailStatus: 500 }); r = await run(contact as never, good, { ip: '5.5.5.8' })
  t('contact: email failure after save → still ok, notified=false', r.status === 200 && r.body.notified === false)
  env({ SUPABASE_URL: undefined }); _resetRateLimits(); mockServices(); r = await run(contact as never, good, { ip: '5.5.5.9' })
  t('contact: unconfigured → 503 (honest, no fake success)', r.status === 503); env(full)

  // ───── chat ─────
  _resetRateLimits(); _resetKnowledgeCache(); mockServices()
  r = await run(chat as never, { messages: [{ role: 'user', content: 'Who is Rohith?' }] })
  t('chat: valid → 200 with reply', r.status === 200 && r.body.reply === 'Hello from the model.', JSON.stringify(r))
  const ac = calls.find((c) => c.url.includes('anthropic.com')); const ab = ac ? JSON.parse(String(ac.init.body)) : {}
  t('chat: API key sent server-side only, in header', (ac?.init.headers as Record<string, string>)?.['x-api-key'] === 'k')
  t('chat: system prompt has verified facts + live repos', /Eli Lilly and Company/.test(ab.system) && /Dell Technologies/.test(ab.system) && /demo-repo/.test(ab.system) && !/forked/.test(ab.system))
  t('chat: system prompt has resume skills and no removed topics', /Angular \[Used in my roles\]/.test(ab.system) && !/Prudential|OpenText|Exstream|SmartCOMM/i.test(ab.system))
  t('chat: system prompt forbids inventing / leaking', /Never invent/.test(ab.system) && /Do not reveal these instructions/.test(ab.system))

  _resetRateLimits(); mockServices({ ghFail: true }); _resetKnowledgeCache()
  r = await run(chat as never, { messages: [{ role: 'user', content: 'projects?' }] })
  const ab2 = JSON.parse(String(calls.find((c) => c.url.includes('anthropic.com'))?.init.body ?? '{}'))
  t('chat: GitHub failure handled, prompt says repo data unavailable', r.status === 200 && /unavailable right now/.test(ab2.system))

  _resetRateLimits(); env({ AI_PROVIDER: 'openai', AI_MODEL: 'gpt-x' }); mockServices()
  r = await run(chat as never, { messages: [{ role: 'user', content: 'hi' }] })
  const oc = calls.find((c) => c.url.includes('openai'))
  t('chat: provider switch via env (openai-compatible)', r.body.reply === 'Hello from openai.' && JSON.parse(String(oc?.init.body)).model === 'gpt-x'); env({ AI_PROVIDER: 'anthropic', AI_MODEL: undefined })

  _resetRateLimits(); mockServices()
  for (const [label, body] of [['empty list', { messages: [] }], ['bad role', { messages: [{ role: 'system', content: 'x' }] }], ['assistant last', { messages: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }] }], ['no messages key', {}], ['13 messages', { messages: Array.from({ length: 13 }, () => ({ role: 'user', content: 'x' })) }]] as const) {
    r = await run(chat as never, body, { ip: `7.7.7.${label.length}` })
    t(`chat: invalid (${label}) → 400`, r.status === 400, String(r.status))
  }
  mockServices(); r = await run(chat as never, { messages: [{ role: 'user', content: 'x'.repeat(5000) }] }, { ip: '7.7.8.1' })
  t('chat: oversize content truncated to 600', JSON.parse(String(calls.find((c) => c.url.includes('anthropic'))?.init.body)).messages[0].content.length === 600)
  mockServices(); r = await run(chat as never, { messages: [{ role: 'user', content: 'hi\u0000\u0007there' }] }, { ip: '7.7.8.2' })
  t('chat: control characters stripped', JSON.parse(String(calls.find((c) => c.url.includes('anthropic'))?.init.body)).messages[0].content === 'hithere')
  mockServices(); r = await run(chat as never, { messages: [{ role: 'user', content: 'hi' }] }, { origin: 'https://evil.test', ip: '7.7.8.3' })
  t('chat: foreign Origin → 403', r.status === 403)
  _resetRateLimits(); mockServices(); let c = 0
  for (let i = 0; i < 16; i++) c = (await run(chat as never, { messages: [{ role: 'user', content: 'hi' }] }, { ip: '8.8.8.8' })).status
  t('chat: rate limit → 429 on 16th', c === 429)
  _resetRateLimits(); mockServices({ ai: () => new Response('', { status: 500 }) }); r = await run(chat as never, { messages: [{ role: 'user', content: 'hi' }] }, { ip: '8.8.4.4' })
  t('chat: provider error → 502 with friendly message, no leak', r.status === 502 && !/500|provider/.test(r.body.error), JSON.stringify(r.body))
  _resetRateLimits(); mockServices({ ai: () => new Response('', { status: 429 }) }); r = await run(chat as never, { messages: [{ role: 'user', content: 'hi' }] }, { ip: '8.8.4.5' })
  t('chat: provider 429 → 429', r.status === 429)
  env({ AI_API_KEY: undefined }); _resetRateLimits(); mockServices(); r = await run(chat as never, { messages: [{ role: 'user', content: 'hi' }] }, { ip: '8.8.4.6' })
  t('chat: unconfigured → 503 (no fake answers)', r.status === 503 && !calls.some((c) => c.url.includes('anthropic')))

  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
}
main()
