import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { siteSettingsGeneraleSchema } from '~~/shared/validators/req-validators'
import { fileUploader } from '~~/server/utils/uploader'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const body: any = await readValidatedBody(event, body => body)

    let payload

    try {
      payload = siteSettingsGeneraleSchema.parse(JSON.parse(body))

      const { images, text } = separateImageAndTextFields(payload)

      const isExist = await supabaseAdmin.from('site_settings_general').select('*').single()

      if (isExist.data?.id) {
        await supabaseAdmin.from('site_settings_general').update(text)
          .eq('id', isExist.data?.id)
          .select()
      }
      else {
        await supabaseAdmin.from('site_settings_general').insert(text)
      }

      if (images) {
        if (images.logo) {
          const logo = base64ToFile(images.logo as any)
          const uploadResponse = await fileUploader(logo, 'logo.png')
          if (!uploadResponse.ok) {
            const errText = await uploadResponse.text()
            return errorResponse(event, 500, `Upload failed: ${errText}`)
          }

          const uploadResult = await uploadResponse.json()
          await supabaseAdmin.from('site_settings_general').update({ logo: uploadResult.publicUrl })
            .eq('id', isExist.data?.id)
        }
        if (images?.favicon) {
          const favicon = base64ToFile(images.favicon as any)
          const uploadResponse = await fileUploader(favicon, 'favicon.ico')
          if (!uploadResponse.ok) {
            const errText = await uploadResponse.text()
            return errorResponse(event, 500, `Upload failed: ${errText}`)
          }

          const uploadResult = await uploadResponse.json()
          await supabaseAdmin.from('site_settings_general').update({ favicon: uploadResult.publicUrl })
            .eq('id', isExist.data?.id)
        }
      }

      return successResponse(event, 200, 'Site settings updated.')
    }
    catch (error: any) {
      throw createError({
        status: 400,
        message: error.message,
      })
    }
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('got error from update site settings API.', error)
    return errorResponse(event, 500, error.message)
  }
})
