import { baseLayout } from './base-layout'

export function otpTemplate(code: string): string {
  return baseLayout({
    title: 'Verification Code',
    previewText: `Your OTP code is ${code}`,
    bodyContent: `
      <h2 style="color: #151520; margin-top: 0; font-weight: 600;">Hello,</h2>
      <p>Your verification code is:</p>
      <div style="font-size: 32px; font-weight: bold; color: #FC6A03; text-align: center; letter-spacing: 8px; padding: 16px; margin: 16px 0; background: #FFF5E6; border-radius: 6px;">
        ${code}
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p style="color: #888; font-size: 13px;">If you did not request this code, please ignore this email.</p>
    `,
  })
}
