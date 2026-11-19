/** Minimal PostgREST client using the SERVICE ROLE key. Server-only; the key never reaches the browser. */
export function supabaseConfig() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? { url: url.replace(/\/$/, ''), key } : null
}

const headers = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' })

export async function insertMessage(row: Record<string, unknown>): Promise<void> {
  const c = supabaseConfig(); if (!c) throw new Error('supabase not configured')
  const res = await fetch(`${c.url}/rest/v1/messages`, { method: 'POST', headers: { ...headers(c.key), Prefer: 'return=minimal' }, body: JSON.stringify(row) })
  if (!res.ok) throw new Error(`supabase insert failed: ${res.status}`)
}

export async function countRecentByIp(ipHash: string, sinceIso: string): Promise<number> {
  const c = supabaseConfig(); if (!c) return 0
  const res = await fetch(`${c.url}/rest/v1/messages?select=id&ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${encodeURIComponent(sinceIso)}`,
    { headers: { ...headers(c.key), Prefer: 'count=exact', Range: '0-0' } })
  const range = res.headers.get('content-range') // "0-0/3" or "*/0"
  const total = range?.split('/')[1]
  return total && total !== '*' ? Number(total) : 0
}
