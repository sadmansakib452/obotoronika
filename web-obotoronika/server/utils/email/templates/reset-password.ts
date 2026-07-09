import { baseLayout } from './base-layout'

export function resetPasswordTemplate(code: string): string {
  return baseLayout({
    title: 'Password Reset Code',
    previewText: `Your password reset code is ${code}`,
    bodyContent: `
      <h2 style="color: #151520; margin-top: 0; font-weight: 600;">Password Reset Request</h2>
      <p>You requested to reset your password. Use the code below:</p>
      <div style="font-size: 32px; font-weight: bold; color: #FC6A03; text-align: center; letter-spacing: 8px; padding: 16px; margin: 16px 0; background: #FFF5E6; border-radius: 6px;">
        ${code}
      </div>
      <p>This code will expire in <strong>30 minutes</strong>.</p>
      <p style="color: #888; font-size: 13px;">If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
    `,
  })
}