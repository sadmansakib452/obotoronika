export const generateOrderId = async () => {
  const timestamp = Date.now()
  const obfuscatedDate = timestamp.toString(36).toUpperCase()

  const { data: lastOrder, error: lastOrderError } = await supabaseAdmin
    .from('orders')
    .select('order_id, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (lastOrderError && lastOrderError.code !== 'PGRST116') {
    throw createError({ statusCode: 500, message: 'Failed to fetch the last order.' })
  }

  const lastId = lastOrder ? parseInt(lastOrder.order_id.split('-')[2]) : 0
  const newId = String(lastId + 1).padStart(4, '0')
  return `ORD-${obfuscatedDate}-${newId}`
}

export const generateSubOrderIds = async (count: number) => {
  const timestamp = Date.now()
  const obfuscatedDate = timestamp.toString(36).toUpperCase()

  const { data: lastOrder, error: lastOrderError } = await supabaseAdmin
    .from('merchant_orders')
    .select('sub_order_id, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (lastOrderError && lastOrderError.code !== 'PGRST116') {
    throw createError({ statusCode: 500, message: 'Failed to fetch the last order.' })
  }

  const lastId = lastOrder
    ? parseInt(lastOrder.sub_order_id.split('-')[2])
    : 0

  const ids = []
  for (let i = 1; i <= count; i++) {
    const newId = String(lastId + i).padStart(4, '0')
    ids.push(`SUBORD-${obfuscatedDate}-${newId}`)
  }

  return ids
}

export const decreaseProductStock = async (
  supabase: any,
  items: { product_id: string, quantity: number }[],
  updatedProductQuantities: { product_id: string, previousQuantity: number }[],
) => {
  for (const item of items) {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('current_stock')
      .eq('id', item.product_id)
      .single()

    if (productError || !productData)
      throw createError({
        statusCode: 500,
        message: `Failed to fetch stock for product ${item.product_id}`,
      })

    const newStock = productData.current_stock - item.quantity

    if (newStock < 0) {
      throw createError({
        statusCode: 400,
        message: `Insufficient stock for product ${item.product_id}`,
      })
    }

    // Save previous quantity for rollback if needed
    updatedProductQuantities.push({
      product_id: item.product_id,
      previousQuantity: productData.current_stock,
    })

    const { error: updateError } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', item.product_id)

    if (updateError) {
      throw createError({
        statusCode: 500,
        message: `Failed to update stock for product ${item.product_id}`,
      })
    }
  }
}
