import type { H3Event } from 'h3'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'

type AllowedRole = 'admin' | 'customer' | 'manager' | 'seller' | 'super_admin'

type User = {
  id: string
  user_metadata: {
    merchant_id?: number
    merchant_status?: 'active' | 'inactive' | 'suspended' | 'banned'
    merchant?: string
    name: string
    role: AllowedRole
    status: 'active' | 'inactive' | 'suspended' | 'banned'
  }
}

function validateUser(user: User, allowedRoles: AllowedRole[]): void {
  const role = user?.user_metadata?.role
  const status = user?.user_metadata?.status
  if (!user || !role || !allowedRoles.includes(role) || status !== 'active') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Insufficient permissions',
    })
  }
}

export default async function (
  eventOrSupabase: H3Event | any,
  supabaseOrRoles: any | AllowedRole[],
  allowedRoles?: AllowedRole[],
): Promise<User> {
  const event = allowedRoles !== undefined ? (eventOrSupabase as H3Event) : undefined
  const supabase = event ? supabaseOrRoles : (eventOrSupabase as any)
  const roles = (allowedRoles ?? supabaseOrRoles) as AllowedRole[]

  const { data, error } = await supabase.auth.getUser()
  let user = data?.user

  if (!user && event?.context?.user_id) {
    const { data: adminData } = await supabaseAdmin.auth.admin.getUserById(event.context.user_id)
    user = adminData?.user
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
      data: { error: 'Unauthorized' },
    })
  }

  validateUser(user, roles)
  return user
}
