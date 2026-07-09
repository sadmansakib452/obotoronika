import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: any) => {
  try {
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'seller'])

    const query = await getQuery(event) as Record<string, any>
    const perPage: number = Number(query.per_page) || 10 as number
    const page: number = Number(query.page) || 1 as number
    const search = (query.search as string) || null
    const minSubtotal = query.min_subtotal != null ? Number(query.min_subtotal) : null
    const maxSubtotal = query.max_subtotal != null ? Number(query.max_subtotal) : null

    const offset = (page - 1) * perPage

    // Call function with full signature (6 params) so schema cache finds it
    const { data, error } = await supabaseAdmin.rpc('get_invoices_by_merchant', {
      p_merchant_id: user.user_metadata.merchant_id,
      p_limit: perPage,
      p_offset: offset,
      p_search: search,
      p_min_subtotal: minSubtotal,
      p_max_subtotal: maxSubtotal,
    })

    if (error) throw new Error(error.message)

    // You also need total count separately for pagination UI
    const { count, error: countError } = await supabaseAdmin
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', user.user_metadata.merchant_id)

    if (countError) throw new Error(countError.message)

    const total = count ?? 0
    const totalPages = Math.ceil(total / perPage)

    return successResponse(event, 200, {
      data,
      pagination: {
        total,
        page,
        perPage,
        totalPages,
      },
    })
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('got error from get invoices API route.', error)
    return errorResponse(event, 500, error.message)
  }
})
