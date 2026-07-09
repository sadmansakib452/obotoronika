import { baseLayout } from './base-layout'

export interface WelcomeTemplateParams {
  firstName: string
}

export function welcomeTemplate({ firstName }: WelcomeTemplateParams): string {
  return baseLayout({
    title: 'Welcome to Obotoronika!',
    previewText: `Welcome ${firstName}, your account is ready.`,
    bodyContent: `
      <h2 style="color: #151520; margin-top: 0; font-weight: 600;">Welcome, ${firstName}!</h2>
      <p>Your account has been created successfully.</p>
      <p>You can now browse products, place orders, and track your deliveries.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td align="center" style="background: #FC6A03; border-radius: 6px; padding: 12px 32px;">
            <a href="${process.env.BASE_URL || 'https://obotoronika.ddns.net'}" style="color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; font-family: Poppins, Arial, sans-serif;">Start Shopping</a>
          </td>
        </tr>
      </table>
      <p style="color: #888; font-size: 13px;">If you did not create this account, please contact support.</p>
    `,
  })
}
