import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clean, clientIp, guard, hashIp, json } from './_lib/http.js'
import { rateLimit } from './_lib/ratelimit.js'
import { buildSystemPrompt, loadRepos } from './_lib/knowledge.js'
import { AiError, complete, type ChatMessage } from './_lib/ai.js'

const MAX_MESSAGES = 12
const MAX_CHARS = 600

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (guard(req, res, 30_000)) return
  if (!process.env.AI_API_KEY) return json(res, 503, { error: "The AI assistant isn't configured yet. Please use the contact form or email instead." })

  const rl = rateLimit(`chat:${hashIp(clientIp(req))}`, 15, 10 * 60_000)
  if (!rl.ok) { res.setHeader('Retry-After', String(rl.retryAfterSec)); return json(res, 429, { error: "You're sending questions quickly. Please wait a moment and try again." }) }

  const raw = (req.body as { messages?: unknown }).messages
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return json(res, 400, { error: 'Invalid conversation.' })
  const messages: ChatMessage[] = []
  for (const m of raw as Array<{ role?: unknown; content?: unknown }>) {
    if (m?.role !== 'user' && m?.role !== 'assistant') return json(res, 400, { error: 'Invalid conversation.' })
    const content = clean(m.content, MAX_CHARS)
    if (!content) return json(res, 400, { error: 'Messages cannot be empty.' })
    messages.push({ role: m.role, content })
  }
  if (messages[messages.length - 1].role !== 'user' || messages[0].role !== 'user') return json(res, 400, { error: 'Invalid conversation.' })

  try {
    const system = buildSystemPrompt(await loadRepos())
    const reply = await complete(system, messages)
    return json(res, 200, { reply })
  } catch (e) {
    const status = e instanceof AiError ? e.status : 500
    console.error('chat: failed', e instanceof Error ? e.message : 'unknown')   // never log message contents
    if (status === 429) return json(res, 429, { error: 'The assistant is busy right now. Please try again in a moment.' })
    return json(res, 502, { error: 'The assistant is unavailable right now. Please try again, or use the contact form.' })
  }
}
