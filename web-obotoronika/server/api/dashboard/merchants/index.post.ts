import { z } from 'zod'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

const schema = z.object({
  user_id: z.string({ required_error: 'User ID is required.' }),
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  status: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin'])

    const form = await readFormData(event)
    const logo = form.get('image')
    const user_id = form.get('user_id')
    const name = form.get('name')
    const description = form.get('description')
    const address = form.get('address')
    const website = form.get('website')
    const status = form.get('status')

    const requestBody = {
      ...(user_id && { user_id }),
      ...(name && { name }),
      ...(description && { description }),
      ...(address && { address }),
      ...(website && { website }),
      ...(status && { status }),
    }

    const data = schema.parse(requestBody)

    const payload: any = {
      ...data,
    }

    if (logo) {
      const config = useRuntimeConfig()
      const supportedFormats = ['jpg', 'jpeg', 'png', 'gif']
      if (!isValidBase64File(logo as any, supportedFormats)) {
        return errorResponse(event, 400, 'Invalid file format.')
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
      payload.logo = uploadResult.publicUrl
    }

    const { error, data: merchant }: any = await supabaseAdmin
      .from('merchants')
      .insert(payload)
      .select()

    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Internal Server Error',
      })
    }

    await supabaseAdmin.auth.admin.updateUserById(merchant[0].user_id, {
      user_metadata: {
        merchant_id: merchant[0].id,
        merchant_status: merchant[0].status,
        merchant: merchant[0].name,
      },
    })

    // await supabaseAdmin
    //   .from('profiles')
    //   .update({ merchant_id: merchant[0].id })
    //   .eq('id', merchant[0].user_id)

    return successResponse(event, 201, 'Merchant created successfully.')
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('got error from create merchant API route.', error)
    return errorResponse(event, 500, error.message)
  }
})
