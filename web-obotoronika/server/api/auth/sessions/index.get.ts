import type { H3Event } from 'h3'
import { sessionsQuerySchema } from '@@/server/utils/query'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['admin', 'customer', 'manager', 'seller', 'super_admin'])

    const query = getQuery(event)
    const validatedQuery = sessionsQuerySchema.parse(query)
    const { page, perPage } = validatedQuery

    let supabaseQuery = supabaseAdmin
      .from('user_sessions')
      .select('id, device, os, browser, browser_version, ip, last_active, session_token', { count: 'exact' })
      .order('last_active', { ascending: false })

    supabaseQuery = supabaseQuery
      .range((page - 1) * perPage, page * perPage - 1)

    // Execute the query
    const { data, error, count } = await supabaseQuery

    if (error) throw new Error(error.message)

    const currentToken = getCookie(event, 'session_token')
    const hashedCurrent = currentToken ? await hashSessionToken(currentToken) : null

    const modified_data = data.map(session => ({
      device: session.device,
      os: session.os,
      browser: session.browser,
      browser_version: session.browser_version,
      id: session.id,
      ip: session.ip,
      last_active: session.last_active,
      current: session.session_token === hashedCurrent,
    }))

    return successResponse(event, 200, {
      data: modified_data,
      //   data2: data,
      meta: {
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      },
    })
  }
  catch (error: any) {
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    console.error('got error from get all merchants API.', error)
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
