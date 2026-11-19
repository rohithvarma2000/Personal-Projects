export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export class AiError extends Error { constructor(public status: number, msg: string) { super(msg) } }

/** Provider adapter. Change provider/model/base URL through env vars only. */
export async function complete(system: string, messages: ChatMessage[]): Promise<string> {
  const key = process.env.AI_API_KEY
  if (!key) throw new AiError(503, 'not configured')
  const provider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase()
  const model = process.env.AI_MODEL || (provider === 'openai' ? 'gpt-4o-mini' : 'claude-haiku-5-5')
  const signal = AbortSignal.timeout(25_000)

  let res: Response
  try {
    if (provider === 'anthropic') {
      res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', signal, headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: 500, system, messages }),
      })
    } else if (provider === 'openai') {
      const base = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
      res = await fetch(`${base}/chat/completions`, {
        method: 'POST', signal, headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: 500, temperature: 0.3, messages: [{ role: 'system', content: system }, ...messages] }),
      })
    } else throw new AiError(500, `unknown AI_PROVIDER "${provider}"`)
  } catch (e) {
    if (e instanceof AiError) throw e
    throw new AiError(504, 'provider unreachable')
  }
  if (!res.ok) {
    // Log only the provider's error type/message (never the visitor's text) to make failures diagnosable.
    let reason = ''
    try { const b = (await res.json()) as { error?: { type?: string; message?: string } }; reason = `${b.error?.type ?? ''}: ${(b.error?.message ?? '').slice(0, 200)}` } catch { /* ignore */ }
    throw new AiError(res.status === 429 ? 429 : 502, `provider error ${res.status} ${reason}`.trim())
  }
  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }>; choices?: Array<{ message?: { content?: string } }> }
  const text = provider === 'anthropic' ? data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('') : data.choices?.[0]?.message?.content
  if (!text?.trim()) throw new AiError(502, 'empty response')
  return text.trim()
}
