import { createClient } from '@supabase/supabase-js'

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const DEFAULT_SUPER_ADMIN_NAME = 'Super Admin'
const DEFAULT_SUPER_ADMIN_MERCHANT_NAME = 'Admin Merchant'
const DEFAULT_SUPER_ADMIN_CATEGORY_NAME = 'Default Category'

export default defineEventHandler(async (event) => {
  // Dev-only bootstrap. Never allow this in production.
  if (process.env.NODE_ENV === 'production') {
    return errorResponse(event, 404, 'Not Found')
  }

  const config = useRuntimeConfig()
  const supabaseAdmin = createClient(config.supabaseURL, config.supabaseRoleKey)

  const email = (process.env.SUPER_ADMIN_EMAIL || '').trim()
  const password = (process.env.SUPER_ADMIN_PASSWORD || '').trim()

  const name = DEFAULT_SUPER_ADMIN_NAME
  const merchantName = DEFAULT_SUPER_ADMIN_MERCHANT_NAME
  const categoryName = DEFAULT_SUPER_ADMIN_CATEGORY_NAME

  if (!email || !password) {
    return errorResponse(event, 500, 'Missing env vars: SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD')
  }

  try {
    // 1) Create super admin auth user (or reuse if already exists)
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: email || undefined,
      app_metadata: { name },
      password,
      email_confirm: true,
      user_metadata: {
        status: 'active',
        name,
        avatar_url: '',
        role: 'super_admin',
        merchant_id: null,
        merchant_status: null,
        merchant: null,
      },
    })

    if (createErr) {
      let existingUserId: string | null = null
      const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
      const existing = data?.users?.find(u => (u.email || '').toLowerCase() === email.toLowerCase())
      existingUserId = existing?.id ?? null
      if (!existingUserId) return errorResponse(event, 500, createErr.message)

      // Ensure role metadata is correct (idempotent)
      await supabaseAdmin.auth.admin.updateUserById(existingUserId, {
        user_metadata: { role: 'super_admin', status: 'active', name },
      })

      // Continue bootstrap using existing user id
      return await bootstrapDependencies(event, supabaseAdmin, existingUserId, merchantName, categoryName)
    }

    const userId = created?.user?.id
    if (!userId) return errorResponse(event, 500, 'Failed to create super admin user.')

    // 2) Create merchant + category dependencies so product creation works immediately.
    return await bootstrapDependencies(event, supabaseAdmin, userId, merchantName, categoryName)
  }
  catch (error: any) {
    return errorResponse(event, 500, error.message)
  }
})

async function bootstrapDependencies(
  event: any,
  supabaseAdmin: any,
  userId: string,
  merchantName: string,
  categoryName: string,
) {
  // Create (or reuse) merchant for this user
  const { data: existingMerchant } = await supabaseAdmin
    .from('merchants')
    .select('id, name, status')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle()

  let merchant = existingMerchant
  if (!merchant) {
    const { data: inserted, error } = await supabaseAdmin
      .from('merchants')
      .insert({
        user_id: userId,
        name: merchantName,
        description: 'Bootstrap merchant (dev-only)',
        status: 'active',
      })
      .select('id, name, status')
      .single()

    if (error) return errorResponse(event, 500, error.message)
    merchant = inserted
  }

  // Write merchant details to user metadata (so product creation inserts merchant_id)
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      role: 'super_admin',
      status: 'active',
      merchant_id: merchant.id,
      merchant_status: merchant.status,
      merchant: merchant.name,
    },
  })

  // Create a default category if none exists (products require category_id)
  const { count: categoryCount, error: catCountErr } = await supabaseAdmin
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)

  if (catCountErr) return errorResponse(event, 500, catCountErr.message)
  if (!categoryCount || categoryCount === 0) {
    const { error: catErr } = await supabaseAdmin
      .from('categories')
      .insert({
        name: categoryName,
        slug: toSlug(categoryName) || 'default-category',
        is_active: true,
      })

    if (catErr) return errorResponse(event, 500, catErr.message)
  }

  return successResponse(event, 200, {
    ok: true,
    user_id: userId,
    merchant_id: merchant.id,
    merchant_name: merchant.name,
    category_seeded: true,
  })
}
