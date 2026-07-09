import nodemailer from 'nodemailer'

export interface SmtpConfig {
  host: string
  port: number
  user: string
  pass: string
  from: string
}

export interface SmtpEmailOptions {
  from?: string
  to: string | string[]
  subject: string
  html: string
}

export function createSmtpProvider(config: SmtpConfig) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  return {
    name: 'smtp' as const,
    send: async (options: SmtpEmailOptions) => {
      await transporter.sendMail({
        from: options.from || config.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
      })
    },
  }
}
