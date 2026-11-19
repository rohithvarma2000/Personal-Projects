import { createHash } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const json = (res: VercelResponse, status: number, body: unknown) => {
  res.setHeader('Cache-Control', 'no-store')
  res.status(status).json(body)
}

export function clientIp(req: VercelRequest): string {
  const xff = req.headers['x-forwarded-for']
  const raw = Array.isArray(xff) ? xff[0] : xff
  return (raw?.split(',')[0] ?? req.socket?.remoteAddress ?? 'unknown').trim()
}

export const hashIp = (ip: string) => createHash('sha256').update(`${process.env.IP_HASH_SALT ?? ''}:${ip}`).digest('hex').slice(0, 32)

/**
 * Browsers always send Origin on cross-site and same-site POSTs. Require it to match this host
 * or an entry in ALLOWED_ORIGINS. Blocks casual cross-site abuse of the endpoints.
 */
export function originAllowed(req: VercelRequest): boolean {
  const origin = req.headers.origin
  if (!origin) return false
  const allowed = (process.env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  if (allowed.includes(origin)) return true
  try { return new URL(origin).host === req.headers.host } catch { return false }
}

/** Common guard: POST only, same-origin, bounded body. Returns true when the request should stop. */
export function guard(req: VercelRequest, res: VercelResponse, maxBytes: number): boolean {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); json(res, 405, { error: 'Method not allowed.' }); return true }
  if (!originAllowed(req)) { json(res, 403, { error: 'Forbidden.' }); return true }
  const len = Number(req.headers['content-length'] ?? 0)
  if (len > maxBytes) { json(res, 413, { error: 'Request too large.' }); return true }
  if (typeof req.body !== 'object' || req.body === null) { json(res, 400, { error: 'Invalid request.' }); return true }
  return false
}

/** Strip control characters and normalise whitespace of free text. */
export const clean = (v: unknown, max: number): string =>
  (typeof v === 'string' ? v : '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max)
