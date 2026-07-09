import type { H3Event } from 'h3'
import type { Session } from '@supabase/supabase-js'
import { appendResponseHeader } from 'h3'
import { createChunks, stringToBase64URL } from '@supabase/ssr'

const BASE64_PREFIX = 'base64-'

/**
 * Keep Supabase auth cookies small and short-lived.
 * We align expiry to the app's own `session_token` cookie (7 days) to reduce stale-cookie buildup.
 */
const SUPABASE_MAX_AGE = 60 * 60 * 24 * 7

/**
 * Safety + cleanup bounds.
 * - If the session still produces too many chunks, skip setting cookies to avoid 431 header bloat.
 * - Always clean up a bounded range of old chunk cookies.
 */
const MAX_COOKIE_CHUNKS = 6
const CLEANUP_CHUNK_RANGE = 12

function cookieHeaderValue(
  name: string,
  value: string,
  opts: { path?: string, maxAge?: number, secure?: boolean, sameSite?: string },
) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${opts.path ?? '/'}`,
    `Max-Age=${opts.maxAge ?? 0}`,
  ]
  if (opts.secure) parts.push('Secure')
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`)
  return parts.join('; ')
}

function deleteChunkCookies(event: H3Event, storageKey: string, opts: { path?: string, secure?: boolean, sameSite?: string }) {
  for (let i = 0; i < CLEANUP_CHUNK_RANGE; i++) {
    appendResponseHeader(
      event,
      'set-cookie',
      cookieHeaderValue(`${storageKey}.${i}`, '', { ...opts, maxAge: 0 }),
    )
  }
}

/**
 * Set the Supabase auth session cookies (sb-{projectRef}-auth-token.0, .1, ...)
 * so the client has the same session. Use after OAuth post-login so Google login
 * works like email/password. Uses appendResponseHeader so cookies are sent.
 */
export function setSupabaseAuthCookies(event: H3Event, session: Session, supabaseUrl: string) {
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const storageKey = `sb-${projectRef}-auth-token`
  const sessionPayload = {
    access_token: session.access_token,
    refresh_token: session.refresh_token ?? '',
    expires_at: session.expires_at ?? 0,
    expires_in: session.expires_in ?? 0,
    token_type: session.token_type ?? 'bearer',
  }
  const sessionStr = JSON.stringify(sessionPayload)
  const encoded = BASE64_PREFIX + stringToBase64URL(sessionStr)
  const chunks = createChunks(storageKey, encoded)
  const opts = {
    path: '/',
    maxAge: SUPABASE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  }

  // Defensive: if something still generates an abnormal number of cookie chunks,
  // clear existing ones and skip setting new cookies to avoid 431 (large headers).
  if (chunks.length > MAX_COOKIE_CHUNKS) {
    deleteChunkCookies(event, storageKey, opts)
    return
  }

  for (const chunk of chunks) {
    appendResponseHeader(event, 'set-cookie', cookieHeaderValue(chunk.name, chunk.value, opts))
  }

  // Clean up stale chunks from older, larger payloads.
  for (let i = chunks.length; i < CLEANUP_CHUNK_RANGE; i++) {
    appendResponseHeader(
      event,
      'set-cookie',
      cookieHeaderValue(`${storageKey}.${i}`, '', { ...opts, maxAge: 0 }),
    )
  }
}
