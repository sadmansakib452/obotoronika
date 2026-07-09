import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { userSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])
    const profileID = event.context.params?.id ?? ''

    const body: any = await readValidatedBody(event, body => body)

    let payload

    try {
      payload = userSchema.parse(body)
    }
    catch (error: any) {
      throw createError({
        status: 400,
        message: error.message,
      })
    }

    const { error, data } = await supabaseAdmin.auth.admin.updateUserById(profileID, {
      email: payload.email,
      phone: payload.phone,
      role: payload.role, // cant update this
      password: payload.password,
      email_confirm: body.email ? true : false,
      phone_confirm: body.phone ? true : false,
      app_metadata: {
        name: payload.name,
      },
      user_metadata: {
        status: payload.status,
        name: payload.name,
        avatar_url: '',
        role: payload.role,
      },
    })

    if (error) {
      throw createError({
        message: JSON.stringify(error.message),
        statusCode: 400,
      })
    }

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.log('got error from create users API.', error)
    return errorResponse(event, 500, error.message)
  }
})
