import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin'])

    const merchantID = event.context.params?.id as any

    if (isNaN(merchantID)) {
      return errorResponse(event, 400, 'Invalid category ID.')
    }

    const form = await readFormData(event)
    const logo = form.get('image')
    const user_id = form.get('user_id')
    const name = form.get('name')
    const description = form.get('description')
    const address = form.get('address')
    const website = form.get('website')
    const status = form.get('status')
    const pathname = form.get('pathname') as string | null

    const requestBody = {
      ...(user_id && { user_id }),
      ...(name && { name }),
      ...(address && { address }),
      ...(status && { status }),
      description:
        typeof description === 'string' && description.trim()
          ? description.trim()
          : null,
      website:
        typeof website === 'string' && website.trim() ? website.trim() : null,
    }

    const payload: any = {
      ...requestBody,
    }

    if (logo) {
      const config = useRuntimeConfig()
      const supportedExtensions = ['jpg', 'jpeg', 'png']
      if (!isValidBase64File(logo as any, supportedExtensions)) {
        return errorResponse(event, 400, 'Invalid file format.')
      }

      if (pathname) {
        // await hubBlob().del(`images/merchants/${pathname}`)
      }

      const mainFile = base64ToFile(logo as any)
      const fileName = generateUniqueFileName('merchants', 'jpg')
      const formData = new FormData()
      formData.append('file', mainFile, fileName)

      // Call your Express upload API (adjust URL if needed)
      const uploadResponse = await fetch(`${config.public.mediaUrl}/api/upload?path=["merchants"]&prefix=logo`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text()
        return errorResponse(event, 500, `Upload failed: ${errText}`)
      }
      const uploadResult = await uploadResponse.json()
      payload['logo'] = uploadResult.publicUrl
    }

    const { error, data } = await supabaseAdmin
      .from('merchants')
      .update(payload)
      .eq('id', merchantID)
      .select('*')

    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Internal Server Error',
      })
    }

    if (!data.length) {
      throw createError({
        statusCode: 404,
        message: 'Merchant not found',
      })
    }

    await supabaseAdmin.auth.admin.updateUserById(data[0].user_id, {
      user_metadata: {
        merchant_status: payload.status,
        merchant: payload.name,
      },
    })

    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Internal Server Error',
      })
    }

    return successResponse(event, 200, data[0])
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.log('got error from update merchant API route.', error)
    return errorResponse(event, 500, error.message)
  }
})
