import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const merchantID = event.context.params?.id

    const { data, error } = await supabaseAdmin
      .from('merchants')
      .select('*')
      .eq('id', merchantID)
      .single()

    if (error) {
      return createError({
        message: error.message,
        statusCode: 500,
      })
    }

    return successResponse(event, 200, data)
  }
  catch (error) {
    console.log('got error from get merchant by ID API route.', error)
    return errorResponse(event, 500)
  }
})
