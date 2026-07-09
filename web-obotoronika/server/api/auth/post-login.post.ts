import { appendResponseHeader, setResponseStatus } from 'h3'
import { UAParser } from 'ua-parser-js'
import { createClient } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'
import { generateSessionToken, hashSessionToken } from '@@/server/utils/session'
import { setSupabaseAuthCookies } from '~~/server/utils/supabaseAuthCookies'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { errorResponse } from '~~/server/utils/response'

/** Build Set-Cookie header value so cookies are sent even when setCookie() is not applied. */
function setCookieHeader(
  event: any,
  name: string,
  value: string,
  opts: {
    path?: string
    maxAge?: number
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'lax' | 'strict' | 'none'
  },
) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${opts.path ?? '/'}`,
    `Max-Age=${opts.maxAge ?? 0}`,
  ]
  if (opts.httpOnly) parts.push('HttpOnly')
  if (opts.secure) parts.push('Secure')
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`)
  appendResponseHeader(event, 'set-cookie', parts.join('; '))
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    let user: { id: string, role?: string } | null = null

    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace(/^Bearer\s+/i, '')

    // Allow clients (especially over plain HTTP) to send session in body.
    // This avoids relying on Supabase cookies or Authorization header being preserved.
    const body = (await readBody(event).catch(() => null)) as {
      session?: {
        access_token: string
        refresh_token?: string
        expires_at?: number
        expires_in?: number
        token_type?: string
        user?: { id: string }
      }
    } | null
    const bodySession = body?.session
    const bodyAccessToken = bodySession?.access_token

    if (token) {
      const supabaseAnon = createClient(
        config.public.supabaseUrl as string,
        config.public.supabaseKey as string,
      )
      const {
        data: { user: u },
      } = await supabaseAnon.auth.getUser(token)
      user = u
    }
    else if (bodyAccessToken) {
      const supabaseAnon = createClient(
        config.public.supabaseUrl as string,
        config.public.supabaseKey as string,
      )
      const {
        data: { user: u },
      } = await supabaseAnon.auth.getUser(bodyAccessToken)
      user = u
    }

    if (!user) {
      const supabase = await getServerSupabase(event)
      const {
        data: { user: u },
      } = await supabase.auth.getUser()
      user = u
    }

    if (!user?.id) {
      return errorResponse(event, 401, 'Not authenticated')
    }

    // Only assign 'customer' to brand-new users who have no application role yet.
    // We check user_metadata.role (the app-level role), NOT user.role (the Supabase JWT
    // database role which is ALWAYS 'authenticated' for every regular user).
    // Without this guard, every login — including super_admin — would be downgraded to 'customer'.
    const existingAppRole = (user as any).user_metadata?.role
    const isNewUser = !existingAppRole || existingAppRole === 'authenticated'
    if (isNewUser) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        role: 'customer',
        user_metadata: { status: 'active', role: 'customer', merchant_id: null },
      })
    }

    const ip
      = getHeader(event, 'cf-connecting-ip')
        || getHeader(event, 'x-forwarded-for')
        || event.node.req.socket.remoteAddress
    const userAgent = getHeader(event, 'user-agent') || ''
    const parser = new UAParser(userAgent)
    const result = parser.getResult()

    const rawToken = generateSessionToken()
    const hashedToken = await hashSessionToken(rawToken)
    const session_payload = {
      user_id: user.id,
      session_token: hashedToken,
      device: `${result.device.vendor || 'Unknown'} - ${result.device.model || 'Unknown'}`,
      os: `${result.os?.name || 'Unknown'} - ${result.os?.version || 'Unknown'}`,
      browser: result.browser?.name || 'Unknown',
      browser_version: result.browser?.version || '',
      ip: ip ?? '',
      user_agent: userAgent,
    }

    setCookieHeader(event, 'session_token', rawToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    await supabaseAdmin.from('user_sessions').insert(session_payload)

    // Set Supabase auth cookies (sb-*-auth-token.0, .1) so client uses cookies instead of localStorage
    let session = null
    try {
      const supabase = await getServerSupabase(event)
      const { data } = await supabase.auth.getSession()
      session = data?.session ?? null
    }
    catch {
      // no server session
    }
    if (!session) {
      if (bodySession?.access_token && (!bodySession.user?.id || bodySession.user.id === user.id)) {
        session = bodySession
      }
    }
    if (session) {
      setSupabaseAuthCookies(event, session as Session, config.public.supabaseUrl as string)
    }

    setResponseStatus(event, 204)
    return null
  }
  catch (err) {
    console.error('Post-login error:', err)
    return errorResponse(event, 500, 'Internal server error')
  }
})
