import {
  base64ToFile,
  generateUniqueFileName,
  isValidBase64File,
} from '@@/server/utils/mediaFile'
import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { categorySchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const form = await readFormData(event)
    const file = form.get('image')
    const name = form.get('name')
    const description = form.get('description')
    const parent_id = form.get('parent_id')
    const slug = form.get('slug')

    const requestBody = {
      ...(name && { name }),
      ...(description && { description }),
      ...(parent_id && { parent_id }),
      ...(slug && { slug }),
    }

    const data = categorySchema.parse(requestBody)

    const payload: any = {
      ...data,
    }

    if (file) {
      const config = useRuntimeConfig()
      const supportedFormats = ['jpg', 'jpeg', 'png', 'gif']
      if (!isValidBase64File(file as any, supportedFormats)) {
        return errorResponse(event, 400, 'Invalid file format.')
      }

      // Convert base64 string to File (Blob)
      const mainFile = base64ToFile(file as any)

      // Generate unique file name with extension (use jpg or parse from base64 if you want)
      const fileName = generateUniqueFileName('category', 'jpg')

      // Prepare form data to send to your Express upload API
      const formData = new FormData()
      formData.append('file', mainFile, fileName)

      // Call your Express upload API (adjust URL if needed)
      const uploadResponse = await fetch(`${config.public.mediaUrl}/api/upload?path=["categories"]&prefix=category`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text()
        return errorResponse(event, 500, `Upload failed: ${errText}`)
      }

      const uploadResult = await uploadResponse.json()

      // Use publicUrl returned from your API
      payload.thumbnail = uploadResult.publicUrl
    }

    const { error } = await supabaseAdmin.from('categories').insert(payload)

    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Internal Server Error',
      })
    }

    return successResponse(event, 201, 'Category Created Successfully') as SuccessResponse<string>
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.log('get error from create category', error)
    return errorResponse(event, 500)
  }
})
