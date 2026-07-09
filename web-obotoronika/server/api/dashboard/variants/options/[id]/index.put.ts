import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { variantOptionSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'seller'])

    const option_id = event.context.params?.id || ''
    let payload

    try {
      payload = await readValidatedBody(event, body =>
        variantOptionSchema.parse(JSON.parse(body as string)),
      )
    }
    catch (error: any) {
      throw createError({
        status: 400,
        message: error.message,
      })
    }

    const { data, error } = await supabaseAdmin
      .from('option_values')
      .update({
        value: payload.value,
        label: payload.label,
        updated_at: new Date(),
      })
      .eq('id', option_id)
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: error.message,
      })
    }

    return successResponse(event, 200)
  }
  catch (error: any) {
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (!error?.statusCode) {
      console.error('got error from get Option by ID.', error)
    }
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
