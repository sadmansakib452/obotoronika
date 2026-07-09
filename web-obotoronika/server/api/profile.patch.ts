import type { H3Event } from 'h3'
import { z } from 'zod'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import supabaseAdmin from '@@/server/utils/supabaseAdmin'

const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please provide a valid email address').optional(),
  phone: z
    .string()
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Please provide a valid phone number')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other']).optional().nullable(),
  dob: z.string().optional().nullable(), // ISO date string
})

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, [
      'customer',
      'super_admin',
    ])

    const body = await readBody(event)
    const payload = profileUpdateSchema.parse(body)

    const existingMeta = (user.user_metadata as Record<string, unknown>) || {}
    const user_metadata = {
      ...existingMeta,
      name: payload.name,
      ...(payload.gender != null && { gender: payload.gender }),
      ...(payload.dob != null && payload.dob !== '' && { dob: payload.dob }),
    }

    const updatePayload: {
      user_metadata: Record<string, unknown>
      email?: string
      phone?: string
    } = { user_metadata }

    if (payload.email !== undefined && payload.email !== '')
      updatePayload.email = payload.email
    if (payload.phone !== undefined)
      updatePayload.phone = payload.phone === '' ? undefined : payload.phone

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, updatePayload)

    if (error) {
      throw createError({
        statusCode: 400,
        message: error.message,
      })
    }

    return successResponse(event, 200, null, 'Profile updated successfully.')
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.statusCode === 400)
      return errorResponse(event, 400, error.message)
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Profile update error:', error)
    return errorResponse(event, 500, 'Failed to update profile')
  }
})
