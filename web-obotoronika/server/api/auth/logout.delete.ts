import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Use cookie-based client so signOut() clears auth cookies in the response.
    // getServerSupabase() would use a token-based client when Authorization is sent and would not clear cookies.
    const supabase = await serverSupabaseClient(event)
    await supabase.auth.signOut({ scope: 'local' })
    return successResponse(event, 200, 'Logged out successfully.')
  }
  catch (error) {
    console.log('got error from logout api route ->', error)
    return errorResponse(event, 500)
  }
})
