import { z } from 'zod'
import { sendEmail } from '@@/server/utils/email'
import { resetPasswordTemplate } from '@@/server/utils/email/templates/reset-password'
import generateOTP from '~~/server/utils/generateOTP'
import { errorResponse, successResponse } from '~~/server/utils/response'

const schema = z.object({
  emailOrPhone: z.string(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, body => schema.safeParse(body))
    if (body.error) {
      return errorResponse(event, 400, body.error.message)
    }

    const emailOrPhone = body.data.emailOrPhone.trim()

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('verifications')
      .select('id, is_verified')
      .eq('email_or_phone', emailOrPhone)
      .single()

    // Generate reset code
    const resetCode = generateOTP()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes

    if (user) {
      // Update existing record with reset code
      const { error: updateError } = await supabaseAdmin
        .from('verifications')
        .update({
          code: resetCode,
          expires_at: expiresAt,
          // Use a flag to indicate this is a password reset, not verification
        })
        .eq('id', user.id)

      if (updateError) {
        return errorResponse(event, 500, 'Failed to process request')
      }
    }
    else {
      // Create new record for password reset
      const { error: insertError } = await supabaseAdmin
        .from('verifications')
        .insert({
          email_or_phone: emailOrPhone,
          code: resetCode,
          expires_at: expiresAt,
          is_verified: false, // Not verified yet
        })

      if (insertError) {
        return errorResponse(event, 500, 'Failed to process request')
      }
    }

    // Send reset code via email
    if (validateEmail(emailOrPhone)) {
      await sendEmail({
        to: emailOrPhone,
        subject: 'Password Reset Code - Obotoronika',
        html: resetPasswordTemplate(resetCode),
      })
    }
    else {
      // Phone number - return the code for testing (in production, send via SMS)
      return successResponse(event, 200, {
        message: 'Reset code sent (SMS not implemented, use email)',
        // For testing: return code - remove in production
        // testCode: resetCode
      })
    }

    return successResponse(event, 200, 'Password reset code sent to your email')
  }
  catch (error: any) {
    console.error('[forgot-password] Error:', error.message)
    return errorResponse(event, 500, 'Failed to process request')
  }
})
