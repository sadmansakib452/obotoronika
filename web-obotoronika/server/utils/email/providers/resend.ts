import { Resend } from 'resend'

export interface ResendConfig {
  apiKey: string
}

export interface ResendEmailOptions {
  from: string
  to: string | string[]
  subject: string
  html: string
}

export function createResendProvider(config: ResendConfig) {
  const client = new Resend(config.apiKey)

  return {
    name: 'resend' as const,
    send: async (options: ResendEmailOptions) => {
      const res = await client.emails.send({
        from: options.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      })

      if (!res.data) {
        throw new Error(res.error?.message || 'Resend failed to send email')
      }
    },
  }
}
