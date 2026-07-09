import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { categorySchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    checkUserRole(supabase, ['admin', 'super_admin'])
    const categoryID = event.context.params?.id as any

    if (isNaN(categoryID)) {
      return errorResponse(event, 400, 'Invalid category ID.')
    }

    // Parse form data
    const form = await readFormData(event)
    const file = form.get('image') as File | null
    const name = form.get('name') as string | null
    const slug = form.get('slug') as string | null
    const description = form.get('description') as string | null
    const parent = form.get('parent_id') as string | null
    const pathname = form.get('pathname') as string | null

    // Build request body
    const requestBody: any = {
      ...(name && { name }),
      ...(slug && { slug }),
      ...(description && { description }),
      ...(parent && { parent: parseInt(parent, 10) }),
    }

    const validation = categorySchema.safeParse(requestBody)
    if (!validation.success) {
      const errors: any = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return errorResponse(event, 400, errors)
    }

    const payload: any = {
      ...validation.data,
    }

    if (file) {
      const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif']
      if (!isValidBase64File(file as any, supportedExtensions)) {
        return errorResponse(event, 400, 'Invalid file format.')
      }

      if (pathname) {
        await hubBlob().del(`images/categories/${pathname}`)
      }

      const mainFile = base64ToFile(file as any)
      ensureBlob(mainFile, {
        maxSize: '4MB',
        types: ['image'],
      })

      const fileName = generateUniqueFileName('categories', 'jpg')
      await hubBlob().put(fileName, mainFile, {
        addRandomSuffix: false,
        prefix: 'images/categories',
      })
      payload['thumbnail'] = fileName
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(payload)
      .eq('id', categoryID)
      .select()

    if (error) {
      return createError({
        message: error.message,
        status: 500,
      })
    }

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('get error from update category ->', error)
    return errorResponse(event, 500)
  }
})
