import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const userAgent = getHeader(event, 'user-agent') || null
    const referrer = getHeader(event, 'referer') || null

    const {
      ip,
      country,
      region,
      city,
      latitude,
      longitude,
      pageVisited,
      deviceType,
      sessionId,
    } = body

    // Step 1: Try to fetch existing row by session_id and ip_address
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('visitor_logs')
      .select('id, page_visited')
      .eq('session_id', sessionId)
      .eq('ip_address', ip)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    // Step 2: Merge arrays if existing row found
    let mergedPageVisited = [pageVisited]
    if (existing?.page_visited) {
      const set = new Set([...existing.page_visited, pageVisited])
      mergedPageVisited = Array.from(set) // remove duplicates
    }

    // Step 3: Upsert (insert or update)
    const { error: upsertError } = await supabaseAdmin.from('visitor_logs').upsert({
      ip_address: ip,
      country,
      region,
      city,
      latitude,
      longitude,
      user_agent: userAgent,
      page_visited: mergedPageVisited,
      referrer: referrer,
      device_type: deviceType,
      session_id: sessionId,
    }, {
      onConflict: ['session_id', 'ip_address'],
    })

    if (upsertError) {
      throw upsertError
    }

    return { success: true }
  }
  catch (error) {
    console.error('Visitor log error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to log visitor',
      data: error instanceof Error ? error.message : String(error),
    })
  }
})
