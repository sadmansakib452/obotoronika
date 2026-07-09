import { z } from 'zod'
import { errorResponse, successResponse } from '~~/server/utils/response'

const schema = z.object({
  emailOrPhone: z.string(),
  code: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, body => schema.safeParse(body))
    if (body.error) {
      return errorResponse(event, 400, body.error.message)
    }

    const { emailOrPhone, code, newPassword } = body.data

    // Find the verification record
    const { data: record, error } = await supabaseAdmin
      .from('verifications')
      .select('id, code, expires_at')
      .eq('email_or_phone', emailOrPhone)
      .single()

    if (error || !record) {
      return errorResponse(event, 404, 'Invalid request. Please try again.')
    }

    // Verify code
    if (record.code !== code) {
      return errorResponse(event, 400, 'Invalid reset code.')
    }

    // Check expiry (30 minutes)
    const nowTime = Date.now()
    const expiresTime = new Date(record.expires_at).getTime()

    if (nowTime > expiresTime) {
      return errorResponse(event, 400, 'Reset code has expired. Please request a new one.')
    }

    // Determine if it's email or phone
    let isEmail = false
    if (validateEmail(emailOrPhone.trim())) {
      isEmail = true
    }

    // Update password in Supabase Auth
    const { error: updateError } = isEmail
      ? await supabaseAdmin.auth.admin.updateUserByEmail(emailOrPhone.trim(), {
          password: newPassword,
        })
      : await supabaseAdmin.auth.admin.updateUser(emailOrPhone.trim(), {
          password: newPassword,
        })

    if (updateError) {
      console.error('[reset-password] updateUser error:', updateError)
      return errorResponse(event, 500, 'Failed to reset password. Please try again.')
    }

    // Clear the reset code
    await supabaseAdmin
      .from('verifications')
      .update({
        code: null,
        expires_at: null,
      })
      .eq('id', record.id)

    return successResponse(event, 200, 'Password has been reset successfully. Please login with your new password.')
  }
  catch (error: any) {
    console.error('[reset-password] Error:', error.message)
    return errorResponse(event, 500, 'Failed to reset password')
  }
})