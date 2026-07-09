import { verifySchema } from '~~/server/database/schema-validator'
import { errorResponse, successResponse } from '~~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, body =>
      verifySchema.parse(body),
    )

    const { emailOrPhone, code } = body

    const { data: record, error } = await supabaseAdmin
      .from('verifications')
      .select('*')
      .eq('email_or_phone', emailOrPhone)
      .single()

    if (error) {
      return errorResponse(event, 400, error.message)
    }

    if (!record) {
      return errorResponse(event, 404, 'Invalid email or phone number.')
    }

    if (record.is_verified && !record.code) {
      return errorResponse(event, 400, 'Already verified.')
    }

    if (record.code !== code) {
      return errorResponse(event, 400, 'Invalid verification code.')
    }

    const nowTime = Date.now()
    const expiresTime = new Date(record.expires_at).getTime()

    if (nowTime > expiresTime) {
      return errorResponse(event, 400, 'Verification code has expired.')
    }

    const { error: updateError } = await supabaseAdmin
      .from('verifications')
      .update({
        is_verified: true,
        expires_at: null,
      })
      .eq('id', record.id)

    if (updateError) {
      return errorResponse(event, 500, 'Failed to verify. Please try again.')
    }

    return successResponse(event, 200, 'Verification successful.')
  }
  catch (error: any) {
    return errorResponse(event, 500, error.message)
  }
})
