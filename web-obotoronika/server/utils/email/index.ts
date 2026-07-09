import { createResendProvider } from './providers/resend'
import { createSmtpProvider } from './providers/smtp'
import type { ResendEmailOptions } from './providers/resend'
import type { SmtpEmailOptions } from './providers/smtp'

type EmailOptions = {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

const DEFAULT_FROM = 'Obotoronika <noreply@obotoronika.com>'

/**
 * Send an email using Resend as the primary provider.
 * Falls back to SMTP when RESEND_API_KEY is not configured.
 */
export async function sendEmail(options: EmailOptions) {
  const config = useRuntimeConfig()
  const resendApiKey = config.resendApiKey as string | undefined
  const smtpHost = config.smtpHost as string | undefined
  const smtpPort = config.smtpPort as string | undefined
  const smtpUser = config.smtpUser as string | undefined
  const smtpPass = config.smtpPass as string | undefined

  // Resend available (not empty, not undefined) → use it
  const hasResendKey = resendApiKey && resendApiKey.trim().length > 0
  if (hasResendKey) {
    console.log('Sending email via Resend...')
    const resend = createResendProvider({ apiKey: resendApiKey })
    const resendOptions: ResendEmailOptions = {
      from: options.from || DEFAULT_FROM,
      ...options,
    }
    await resend.send(resendOptions)
    return
  }

  // Fallback to SMTP
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    throw new Error('No email provider configured. Set RESEND_API_KEY or SMTP_* environment variables.')
  }

  const smtp = createSmtpProvider({
    host: smtpHost,
    port: Number(smtpPort),
    user: smtpUser,
    pass: smtpPass,
    from: options.from || DEFAULT_FROM,
  })

  const smtpOptions: SmtpEmailOptions = {
    from: options.from || DEFAULT_FROM,
    ...options,
  }
  await smtp.send(smtpOptions)
}
