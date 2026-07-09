import type { H3Event } from 'h3'
import {
  base64ToFile,
  generateUniqueFileName,
  isValidBase64File,
} from '@@/server/utils/mediaFile'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { bannerSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const form = await readFormData(event)
    const image = form.get('image')
    const title = form.get('title')
    const description = form.get('description')
    const button_text = form.get('button_text')
    const button_link = form.get('button_link')
    const section_id = form.get('section_id')
    const status = form.get('status')
    const display_order = form.get('display_order')

    const requestBody: any = {
      ...(title && { title: title.toString() }),
      ...(description && { description: description.toString() }),
      ...(button_text && { button_text: button_text.toString() }),
      ...(button_link && { button_link: button_link.toString() }),
      ...(section_id && { section_id: parseInt(section_id.toString()) }),
      ...(status && { status: status.toString() }),
      ...(display_order && { display_order: parseInt(display_order.toString()) }),
    }

    // Validate the body
    let payload
    try {
      payload = bannerSchema.parse(requestBody)
    }
    catch (error: any) {
      throw createError({
        status: 400,
        message: error.message,
      })
    }

    // Handle image upload
    if (image) {
      const config = useRuntimeConfig()
      const supportedFormats = ['jpg', 'jpeg', 'png', 'gif']
      if (!isValidBase64File(image as any, supportedFormats)) {
        return errorResponse(event, 400, 'Invalid file format. Supported formats: JPG, PNG, GIF')
      }

      // Convert base64 string to File
      const mainFile = base64ToFile(image as any)

      // Generate unique file name
      const fileName = generateUniqueFileName('banner', 'jpg')

      // Prepare form data to send to upload API
      const formData = new FormData()
      formData.append('file', mainFile, fileName)

      // Call upload API
      const uploadResponse = await fetch(`${config.public.mediaUrl}/api/upload?path=["banners"]&prefix=banner`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text()
        return errorResponse(event, 500, `Upload failed: ${errText}`)
      }

      const uploadResult = await uploadResponse.json()
      payload.image_url = uploadResult.publicUrl
    }
    else {
      return errorResponse(event, 400, 'Image is required')
    }

    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert(payload)
      .select('*')

    if (error) {
      throw createError({
        message: JSON.stringify(error.message),
        statusCode: 400,
      })
    }

    return successResponse(event, 201, data)
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('Error in banner creation:', error)
    return errorResponse(event, 500, error.message)
  }
})
