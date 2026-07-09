import type { H3Event } from 'h3'
import { decreaseProductStock, generateOrderId, generateSubOrderIds } from '@@/server/utils/orders'
import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import checkUserRole from '~~/server/utils/checkUserRole'

export default defineEventHandler(async (event: H3Event) => {
  const updatedProductQuantities: {
    product_id: string
    previousQuantity: number
  }[] = []

  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const body = await readBody(event)
    const { items, shippingAddress, customerId, notes } = body

    // ── Validation ────────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(event, 400, 'At least one item is required')
    }

    if (!shippingAddress || !shippingAddress.phone) {
      return errorResponse(event, 400, 'Shipping address with phone is required')
    }

    // ── Resolve user_id ───────────────────────────────────────────
    // customerId (UUID) = existing customer, null = guest order
    let userId: string | null = null
    if (customerId) {
      const { data: existingUser } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('id', customerId)
        .maybeSingle()

      if (!existingUser) {
        return errorResponse(event, 400, 'Selected customer not found')
      }
      userId = customerId
    }

    // ── Fetch products ────────────────────────────────────────────
    const productIds = items.map((item: any) => item.product_id)
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, price, offer_price, merchant_id, current_stock')
      .in('id', productIds)

    if (productsError) {
      return errorResponse(event, 500, 'Failed to fetch products')
    }

    if (!products || products.length !== productIds.length) {
      const foundIds = new Set(products?.map(p => p.id) || [])
      const missingIds = productIds.filter((id: string) => !foundIds.has(id))
      return errorResponse(event, 400, `Products not found: ${missingIds.join(', ')}`)
    }

    // ── Check stock ───────────────────────────────────────────────
    for (const item of items) {
      const product = products.find(p => p.id === item.product_id)
      if (!product) continue
      if (product.current_stock < item.quantity) {
        return errorResponse(event, 400,
          `Insufficient stock for "${product.title}". Available: ${product.current_stock}, requested: ${item.quantity}`,
        )
      }
    }

    // All products validated — safe to assert existence from here on
    const getProduct = (item: { product_id: string }) =>
      products.find(p => p.id === item.product_id)!

    // ── Calculate total ───────────────────────────────────────────
    const totalAmount = items.reduce((acc: number, item: any) => {
      const product = getProduct(item)
      const unitPrice = product.offer_price ?? product.price
      return acc + unitPrice * item.quantity
    }, 0)

    // ── Create order (guest: user_id = null) ──────────────────────
    const orderId = await generateOrderId()
    const orderPayload: Record<string, any> = {
      user_id: userId,
      order_id: orderId,
      status: 'pending',
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      notes: notes || null,
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderPayload)
      .select('id, order_id, total_amount')
      .single()

    if (orderError) {
      return errorResponse(event, 500, `Failed to create order: ${orderError.message}`)
    }

    // ── Create merchant_orders ────────────────────────────────────
    const subOrderIds = await generateSubOrderIds(products.length)
    const merchantPayload = products.map((product, index) => ({
      order_id: order.id,
      merchant_id: product.merchant_id,
      sub_order_id: subOrderIds[index],
      status: 'pending',
    }))

    const { data: insertedMerchantOrders, error: merchantError } = await supabaseAdmin
      .from('merchant_orders')
      .insert(merchantPayload)
      .select('id, merchant_id')

    if (merchantError) {
      throw new Error(`Failed to create merchant orders: ${merchantError.message}`)
    }

    const merchantOrderIdMap = new Map(
      insertedMerchantOrders.map(mo => [mo.merchant_id, mo.id]),
    )

    // ── Create order_items ────────────────────────────────────────
    const orderItems = items.map((item: any) => {
      const product = getProduct(item)
      return {
        order_id: order.id,
        product_id: product.id,
        merchant_order_id: merchantOrderIdMap.get(product.merchant_id),
        variants: item.variants || [],
        quantity: item.quantity || 1,
        price: product.offer_price ?? product.price,
        name: product.title,
      }
    })

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    // ── Create invoice_items ──────────────────────────────────────
    const invoiceItems = items.map((item: any) => {
      const product = getProduct(item)
      return {
        merchant_id: product.merchant_id,
        shipping_cost: 0,
        order_id: order.id,
        product_id: product.id,
        merchant_order_id: merchantOrderIdMap.get(product.merchant_id),
        variants: item.variants || [],
        quantity: item.quantity || 1,
        price: product.offer_price ?? product.price,
      }
    })

    // ── Create invoice via RPC ────────────────────────────────────
    const { data: invoiceData, error: invoiceError } = await supabaseAdmin
      .rpc('create_transaction_and_invoices', {
        p_order_id: order.id,
        p_total_amount: totalAmount,
        p_payment_method: null,
        p_items: invoiceItems,
      })

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`)
    }

    // ── Decrease stock ────────────────────────────────────────────
    await decreaseProductStock(supabaseAdmin, items, updatedProductQuantities)

    return successResponse(event, 201, {
      message: 'Order created successfully',
      order: {
        id: order.id,
        order_id: order.order_id,
        total_amount: order.total_amount,
        is_guest: !userId,
      },
      invoiceData,
    })
  }
  catch (error: any) {
    console.error('[admin create order] Error:', error.message)

    // Rollback stock
    for (const item of updatedProductQuantities) {
      await supabaseAdmin
        .from('products')
        .update({ current_stock: item.previousQuantity })
        .eq('id', item.product_id)
    }

    if (error?.statusCode === 400)
      return errorResponse(event, 400, error.message)
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')

    return errorResponse(event, 500, error.message || 'Failed to create order')
  }
})
