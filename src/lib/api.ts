import { site } from '../config/site'

export interface ApiResult<T> { ok: boolean; status: number; data?: T; error?: string }

/** POST JSON to our own serverless API. Never throws; returns a typed result. */
export async function postJson<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${site.apiBase}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    const json = (await res.json().catch(() => ({}))) as { error?: string } & T
    if (!res.ok) return { ok: false, status: res.status, error: json.error || 'Something went wrong. Please try again.' }
    return { ok: true, status: res.status, data: json }
  } catch {
    return { ok: false, status: 0, error: 'Network error. Check your connection and try again.' }
  }
}
