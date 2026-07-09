import { UAParser } from 'ua-parser-js'
import { generateSessionToken, hashSessionToken } from '@@/server/utils/session'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  try {
    const ip
      = getHeader(event, 'cf-connecting-ip')
        || getHeader(event, 'x-forwarded-for')
        || event.node.req.socket.remoteAddress
    const userAgent = getHeader(event, 'user-agent') || ''
    const parser = new UAParser(userAgent)
    const result = parser.getResult()

    const body: any = await readValidatedBody(event, body => body)

    const supabase = await getServerSupabase(event)

    const { error } = await supabase.auth.signInWithPassword({
      email: body.emailOrPhone,
      password: body.password,
    })

    if (error) {
      throw createError({
        statusCode: 400,
        message: 'Invalid credentials',
      })
    }
    const user = await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'customer', 'seller'])

    const rawToken = generateSessionToken()
    const hashedToken = await hashSessionToken(rawToken)
    const session_payload = {
      user_id: user.id,
      session_token: hashedToken,
      device: `${result.device.vendor || 'Unknown'} - ${result.device.model || 'Unknown'}`,
      os: `${result.os?.name || 'Unknown'} - ${result.os?.version || 'Unknown'}`,
      browser: result.browser?.name || 'Unknown',
      browser_version: result.browser?.version || '',
      ip: ip,
      user_agent: userAgent,
    }

    setCookie(event, 'session_token', rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    await supabaseAdmin.from('user_sessions').insert(session_payload)

    return successResponse(event, 201, error || user)
  }
  catch (error: any) {
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
