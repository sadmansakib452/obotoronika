export interface BaseLayoutParams {
  title: string
  bodyContent: string
  previewText?: string
}

export function baseLayout({ title, bodyContent, previewText }: BaseLayoutParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${previewText ? `<meta name="description" content="${previewText}" />` : ''}
</head>
<body style="font-family: Poppins, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 0 32px; text-align: center;">
              <h1 style="color: #151520; font-size: 24px; margin: 0; font-weight: 700;">Obotoronika</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; font-size: 15px; line-height: 1.6; color: #333; font-family: Poppins, Arial, sans-serif;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center; font-size: 12px; color: #888; font-family: Poppins, Arial, sans-serif;">
              <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 16px;" />
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Obotoronika. All rights reserved.</p>
              <p style="margin: 4px 0 0 0;">This is an automated message, please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
