import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { productSchema } from '~~/server/database/schema-validator'
import transformFormData from '~~/shared/utils/transformFormData'
import { fileUploader } from '~~/server/utils/uploader'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'manager',
      'seller',
    ])

    // Validate merchant for manager/seller roles
    if (['manager', 'seller'].includes(user?.user_metadata.role)) {
      const { merchant_id, merchant_status } = user.user_metadata || {}

      if (!merchant_id) {
        throw createError({
          statusCode: 404,
          message:
            'Merchant not found. Please create a merchant before adding a product.',
        })
      }

      if (merchant_status !== 'active') {
        throw createError({
          statusCode: 403,
          message: 'Merchant is not active.',
        })
      }
    }

    // Parse FormData from the request
    const form = await readFormData(event)
    const body: any = {}
    const files = []

    for (const [key, value] of form.entries()) {
      if (key.includes('file-')) {
        files.push(value)
      }
      else {
        body[key] = value
      }
    }

    // Transform FormData values to match schema types
    const transformedBody = transformFormData(
      { ...body, is_featured: JSON.parse(body?.is_featured ?? 'false'), product_visibility: JSON.parse(body?.product_visibility ?? '[]'), variants: JSON.parse(body?.variants ?? '{}') },
      productSchema,
      ['tags'],
    )

    // Add status based on user role
    const status = ['super_admin', 'admin', 'manager'].includes(user?.user_metadata.role)
      ? 'published'
      : 'pending'

    // Validate the transformed body
    let payload
    try {
      payload = productSchema.parse({ ...transformedBody, status })
    }
    catch (error: any) {
      throw createError({
        statusCode: 400,
        message: JSON.stringify(error.errors),
      })
    }

    const thumbnail = payload?.thumbnail
    const config = useRuntimeConfig()

    if (thumbnail) {
      const supportedFormats = ['jpg', 'jpeg', 'png', 'gif']
      if (!isValidBase64File(thumbnail as string, supportedFormats)) {
        return errorResponse(event, 400, 'Invalid file format.')
      }

      const mainFile = base64ToFile(thumbnail as any)

      const fileName = generateUniqueFileName('product', 'jpg')
      // Prepare form data to send to your Express upload API
      const formData = new FormData()
      formData.append('file', mainFile, fileName)

      // Call your Express upload API (adjust URL if needed)
      const uploadResponse = await fetch(`${config.public.mediaUrl}/api/upload?path=["categories"]&prefix=product`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text()
        return errorResponse(event, 500, `Upload failed: ${errText}`)
      }
      const uploadResult = await uploadResponse.json()
      payload.thumbnail = uploadResult.publicUrl
    }

    const filesURL: string[] = []

    if (files.length) {
      for (const file of files) {
        const supportedFormats = ['jpg', 'jpeg', 'png', 'gif']
        if (!isValidBase64File(file as string, supportedFormats)) {
          return errorResponse(event, 400, 'Invalid file format.')
        }

        const mainFile = base64ToFile(file as any)

        // Generate unique file name with extension (use jpg or parse from base64 if you want)
        const fileName = generateUniqueFileName('product', 'jpg')

        // Call your Express upload API (adjust URL if needed)
        const uploadResponse = await fileUploader(mainFile, fileName, 'path=["categories"]&prefix=category')

        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text()
          return errorResponse(event, 500, `Upload failed: ${errText}`)
        }

        const uploadResult = await uploadResponse.json()
        filesURL.push(uploadResult.publicUrl)
      }
    }

    payload.files = filesURL
    payload.merchant_id = user?.user_metadata?.merchant_id

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(payload)
      .select('*')

    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Error inserting product.',
        cause: error.message,
      })
    }

    if (!data?.length) {
      throw createError({
        statusCode: 404,
        message: 'Product not found after insertion.',
      })
    }

    return successResponse(event, 201, data[0])
  }
  catch (error: any) {
    console.error('Error in product creation:', error)

    return errorResponse(
      event,
      error?.statusCode || 500,
      JSON.parse(error.message) || 'Internal Server Error',
    )
  }
})
