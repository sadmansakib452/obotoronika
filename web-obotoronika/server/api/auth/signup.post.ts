import { sendEmail } from '@@/server/utils/email'
import { welcomeTemplate } from '@@/server/utils/email/templates/welcome'
import { registrationSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, body =>
      registrationSchema.parse(body),
    )

    const { emailOrPhone, firstName, lastName, password } = body

    const { data: verificationRecord, error: verificationRecordError } = await supabaseAdmin
      .from('verifications')
      .select('*')
      .eq('email_or_phone', emailOrPhone)
      .single()

    if (!verificationRecord) {
      return errorResponse(event, 404, 'Invalid email or phone number.')
    }

    if (verificationRecordError) {
      return errorResponse(event, 500, 'Something went wrong.')
    }

    if (!verificationRecord.is_verified) {
      return errorResponse(event, 403, 'Your email or phone number is not verified. Please verify it to complete the registration process.')
    }

    let email = ''
    let phone = ''
    const name = `${firstName} ${lastName}`

    if (validateEmail(emailOrPhone.trim())) {
      email = emailOrPhone.trim() // It's a valid email
    }
    else if (validatePhoneNumber(emailOrPhone)) {
      phone = emailOrPhone
    }

    const { error, data } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      phone: phone,
      app_metadata: {
        name: name,
      },
      password: password,
      email_confirm: true,
      role: 'customer',
      user_metadata: {
        status: 'active',
        name: name,
        avatar_url: '',
        role: 'customer',
      },
    })

    // Debug: log the actual error
    if (error) {
      console.error('[signup] createUser error:', error)
    }

    await supabaseAdmin
      .from('verifications')
      .update({
        code: null,
        expires_at: null,
      })
      .eq('id', verificationRecord.id)

    if (error) {
      console.error('[signup] createUser error:', error)

      // User-friendly error for duplicate email/phone
      if (error.message?.includes('already been registered') || error.message?.includes('already exists')) {
        return errorResponse(event, 400, 'This email or phone number is already registered. Please login or use a different one.')
      }

      return errorResponse(event, 500, error.message || 'Something went wrong.')
    }

    // Send welcome email (non-blocking — don't fail signup if email fails)
    if (email) {
      await sendEmail({
        to: email,
        subject: 'Welcome to Obotoronika!',
        html: welcomeTemplate({ firstName }),
      }).catch(() => {
        console.warn(`[signup] Welcome email failed for ${email} — signup succeeded`)
      })
    }

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    return errorResponse(event, 500, error.message)
  }
})
