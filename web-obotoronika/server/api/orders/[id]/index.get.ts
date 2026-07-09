import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'customer',
    ])

    const orderId = event.context.params?.id
    if (!orderId) {
      return errorResponse(event, 400, 'Missing order ID')
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(
        `
        order_id,
        status,
        total_amount,
        created_at,
        shipping_address,
        products:order_items(price, quantity, item:products(id, title, thumbnail, slug))
      `,
      )
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single()

    if (error || !order) {
      return errorResponse(event, 404, 'Order not found')
    }

    const items = (order.products ?? []).filter((p: any) => p?.item).map((p: any) => ({
      price: p.price,
      quantity: p.quantity,
      product: p.item
        ? {
            id: p.item.id,
            title: p.item.title,
            thumbnail: p.item.thumbnail,
            slug: p.item.slug,
          }
        : null,
      subtotal: p.price * p.quantity,
    }))

    return successResponse(event, 200, {
      order: {
        order_id: order.order_id,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        shipping_address: order.shipping_address,
        items,
      },
    })
  }
  catch (error: any) {
    if (error?.statusCode === 400)
      return errorResponse(event, 400, error.message)
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('Error fetching order details:', error)
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
