import { sendEmail } from '@@/server/utils/email'
import { otpTemplate } from '@@/server/utils/email/templates/otp'
import { z } from 'zod'
import generateOTP from '~~/server/utils/generateOTP'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

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
    const code = generateOTP()

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('verifications')
      .select('id, is_verified, code')
      .eq('email_or_phone', emailOrPhone)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected if it's new)
      throw fetchError
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    if (existing) {
      if (existing.is_verified && !existing.code) {
        return errorResponse(event, 400, 'Email or phone already exists and is verified.')
      }

      // Update code if not verified
      const { error: updateError } = await supabaseAdmin
        .from('verifications')
        .update({
          code,
          expires_at: expiresAt,
        })
        .eq('id', existing.id)

      if (updateError) throw updateError
    }
    else {
      // Insert new if does not exist
      const { error: insertError } = await supabaseAdmin
        .from('verifications')
        .insert({
          email_or_phone: emailOrPhone,
          code,
          expires_at: expiresAt,
        })

      if (insertError) throw insertError
    }

    // Send the code via email if it's an email
    if (validateEmail(emailOrPhone)) {
      await sendEmail({
        to: emailOrPhone,
        subject: 'Verification Code',
        html: otpTemplate(code),
      })
    }

    return successResponse(event, 200, 'Verification code sent')
  }
  catch (error: any) {
    return errorResponse(event, 500, error.message)
  }
})
