import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { productSchema } from '~~/server/database/schema-validator'

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
    if (['manager', 'seller'].includes(user?.role)) {
      const { merchant_id, merchant_status } = user.user_metadata || {}

      if (!merchant_id) {
        throw createError({
          statusCode: 404,
          message: 'Merchant not found. Please create a merchant before adding a product.',
        })
      }

      if (merchant_status !== 'active') {
        throw createError({
          statusCode: 403,
          message: 'Merchant is not active.',
        })
      }
    }

    const productID = event.context.params?.id || ''

    // Fetch existing product details
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('thumbnail, files')
      .eq('id', productID)
      .single()

    if (fetchError || !existingProduct) {
      throw createError({
        statusCode: 404,
        message: 'Product not found.',
      })
    }

    const { thumbnail: existingThumbnail, files: existingFiles } = existingProduct

    // Parse FormData from the request
    const form = await readFormData(event)
    const body: Record<string, any> = {}
    const newFiles: string[] = []

    for (const [key, value] of form.entries()) {
      if (key.startsWith('file-')) {
        newFiles.push(value as string)
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
    const status = ['super_admin', 'admin', 'manager'].includes(user?.role) ? 'published' : 'pending'

    // Validate the transformed body
    const payload = productSchema.parse({ ...transformedBody, status })
    const config = useRuntimeConfig()

    // Handle thumbnail
    if (payload.thumbnail) {
      const supportedFormats = ['jpg', 'jpeg', 'png', 'gif']
      if (!isValidBase64File(payload.thumbnail as string, supportedFormats)) {
        throw createError({
          statusCode: 400,
          message: 'Invalid thumbnail format.',
        })
      }

      // Delete existing thumbnail if a new one is provided
      if (existingThumbnail) {
        await fetch(`${config.public.mediaUrl}/api/media?path=${existingThumbnail}`, {
          method: 'DELETE',
        })
      }

      const mainFile = base64ToFile(payload.thumbnail as string)

      const fileName = generateUniqueFileName('product', 'jpg')
      // Prepare form data to send to your Express upload API
      const formData = new FormData()
      formData.append('file', mainFile, fileName)

      // Call your Express upload API (adjust URL if needed)
      const uploadResponse = await fetch(`${config.public.mediaUrl}/api/upload?path=["products"]&prefix=product`, {
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
    else {
      payload.thumbnail = existingThumbnail // Retain existing thumbnail if no new one is provided
    }

    // Handle files
    const filesURL: string[] = []
    if (newFiles.length) {
      const supportedFormats = ['jpg', 'jpeg', 'png', 'gif']

      // Delete existing files if new ones are provided
      if (existingFiles && Array.isArray(existingFiles)) {
        await Promise.all(
          existingFiles.map(async (file) => {
            await fetch(`${config.public.mediaUrl}/api/media?path=${file}`, {
              method: 'DELETE',
            })
          }),
        )
      }

      for (const file of newFiles) {
        if (!isValidBase64File(file, supportedFormats)) {
          throw createError({
            statusCode: 400,
            message: 'Invalid file format.',
          })
        }

        const mainFile = base64ToFile(file as any)
        const fileName = generateUniqueFileName('product', 'jpg')

        // Prepare form data to send to your Express upload API
        const formData = new FormData()
        formData.append('file', mainFile, fileName)

        // Call your Express upload API (adjust URL if needed)
        const uploadResponse = await fetch(`${config.public.mediaUrl}/api/upload?path=["products"]&prefix=product`, {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text()
          return errorResponse(event, 500, `Upload failed: ${errText}`)
        }

        const uploadResult = await uploadResponse.json()
        filesURL.push(uploadResult.publicUrl)
      }
    }
    else {
      filesURL.push(...(existingFiles || [])) // Retain existing files if no new ones are provided
    }

    payload.files = filesURL

    // Update the product in the database
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(payload)
      .eq('id', productID)
      .select('*')
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Error updating product.',
        cause: error.message,
      })
    }

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    console.error('Error updating product:', error)
    return errorResponse(event, error?.statusCode || 500, error.message || 'Internal Server Error')
  }
})
