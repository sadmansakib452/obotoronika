import type { H3Event } from 'h3'
import { ordersQuerySchema } from '@@/server/utils/query'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'customer',
    ])

    const query = getQuery(event)
    const validatedQuery = ordersQuerySchema.parse(query)
    const { page, perPage } = validatedQuery

    const { data, error, count } = await supabaseAdmin
      .from('orders')
      .select(
        `*, products:order_items(price, quantity, item:products(title, thumbnail))`,
        { count: 'exact' },
      )
      .eq('user_id', user.id)
      .eq('status', 'processing')
      .range((page - 1) * perPage, page * perPage - 1)

    if (error) throw new Error(error.message)

    const orders = (data ?? []).map((order) => {
      const products = (order.products ?? []).filter((p: any) => p?.item)
      const firstProduct = products[0]
      const moreCount = products.length > 1 ? products.length - 1 : 0

      return {
        order_id: order.order_id,
        status: order.status,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        created_at: order.created_at,
        first_product: firstProduct
          ? {
              title: firstProduct.item.title,
              thumbnail: firstProduct.item.thumbnail,
              price: firstProduct.price,
              quantity: firstProduct.quantity,
            }
          : null,
        more_products_count: moreCount,
      }
    })

    return successResponse(event, 200, {
      orders: orders,
      meta: {
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      },
    })
  }
  catch (error: any) {
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('got error from get all merchants API.', error)
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
