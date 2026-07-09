import { decreaseProductStock, generateSubOrderIds } from '@@/server/utils/orders'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event) => {
  const updatedProductQuantities: {
    product_id: string
    previousQuantity: number
  }[] = []

  try {
    const supabase = await getServerSupabase(event)

    // Check user role
    const user = await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'manager',
      'customer',
    ])

    const body = await readBody(event)
    const { items, shippingAddress } = body

    if (!items || items.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No items provided for the order.',
      })
    }

    if (!shippingAddress) {
      throw createError({
        statusCode: 400,
        message: 'Shipping address is required.',
      })
    }

    const productIds = items.map((item: any) => item.product_id)

    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, title, price, offer_price, merchant_id')
      .in('id', productIds)

    const totalAmount = items.reduce((acc: number, item: any) => {
      const product
        = products && products.find(p => p.id === item.product_id)
      if (!product) return acc
      const unitPrice = product.offer_price ?? product.price
      return acc + unitPrice * item.quantity
    }, 0)

    const { data: billing, error: _billingError } = await supabaseAdmin.from('addresses').select('id, city, name:fullname, type:address_type, phone, region, address').eq('user_id', user.id).eq('is_billing', true).single()

    const order_payload = {
      user_id: user.id,
      order_id: await generateOrderId(),
      status: 'pending',
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      billing_address: billing,
    }

    const { data: order } = await supabaseAdmin
      .from('orders')
      .insert(order_payload)
      .select('*')
      .single()

    const subOrderIds = await generateSubOrderIds(products ? products.length : 0)

    const merchant_payload = products?.map((product, index) => ({
      order_id: order.id,
      merchant_id: product.merchant_id,
      sub_order_id: subOrderIds[index],
      status: 'pending',
    }))

    const { data: insertedMerchantOrders } = await supabaseAdmin
      .from('merchant_orders')
      .insert(merchant_payload)
      .select('id, merchant_id')

    const merchantOrderIdMap = new Map(
      insertedMerchantOrders && insertedMerchantOrders.map(order => [order.merchant_id, order.id]),
    )

    const order_items = products?.map((product) => {
      const item = items.find((i: any) => i.product_id === product.id)
      return {
        order_id: order.id,
        product_id: product.id,
        merchant_order_id: merchantOrderIdMap.get(product.merchant_id),
        variants: item?.variants || [],
        quantity: item?.quantity || 1,
        price: product.offer_price ?? product.price,
        name: product.title,
      }
    })
    const invoice_items = products?.map((product) => {
      const item = items.find((i: any) => i.product_id === product.id)
      return {
        merchant_id: product.merchant_id,
        shipping_cost: 0,
        order_id: order.id,
        product_id: product.id,
        merchant_order_id: merchantOrderIdMap.get(product.merchant_id),
        variants: item?.variants || [],
        quantity: item?.quantity || 1,
        price: product.offer_price ?? product.price,
      }
    })

    await supabaseAdmin
      .from('order_items')
      .insert(order_items)

    await decreaseProductStock(supabaseAdmin, items, updatedProductQuantities)

    // Create Invoice
    // Call RPC to create transaction and invoices
    const { data: invoiceData, error: invoiceError } = await supabaseAdmin
      .rpc('create_transaction_and_invoices', {
        p_order_id: order.id,
        p_total_amount: totalAmount,
        p_payment_method: null,
        p_items: invoice_items,
      })

    if (invoiceError) throw new Error(invoiceError.message)

    // Remove from cart
    const { error: cartDeleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .in('product_id', items.map((i: any) => i.product_id))

    if (cartDeleteError) {
      console.error('Failed to clear cart:', cartDeleteError.message)
    }

    return successResponse(event, 201, {
      message: 'Order created successfully',
      order,
      invoiceData,
    })
  }
  catch (error: any) {
    console.error('❌ Error creating order:', error.message)

    // Restore product stock
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
    if (error?.errors) return errorResponse(event, 400, error.errors)

    return errorResponse(event, 500, 'Internal Server Error')
  }
})
