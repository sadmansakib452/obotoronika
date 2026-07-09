export default defineEventHandler(async (event) => {
  try {
    // Get all pending orders older than 30 minutes
    const { data: pendingOrders, error } = await supabaseAdmin
      .from('orders')
      .select('id, created_at')
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // 30 minutes ago

    if (error) {
      console.error('Failed to fetch pending orders:', error.message)
      return errorResponse(event, 500, 'Could not fetch pending orders.')
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      return successResponse(event, 200, {
        message: 'No pending orders older than 30 minutes.',
      })
    }

    const failedOrders: number[] = []
    const successOrders: number[] = []

    // Cancel each order via RPC
    for (const order of pendingOrders) {
      const { data, error: cancelError } = await supabaseAdmin.rpc(
        'cancel_order_and_restore_stock',
        { order_id_input: order.id },
      )

      if (cancelError) {
        console.error(`❌ Order ${order.id} failed:`, cancelError.message)
        failedOrders.push(order.id)
      }
      else {
        console.log(`✅ Order ${order.id} canceled:`, data)
        successOrders.push(order.id)
      }
    }

    return successResponse(event, 200, {
      message: 'Order cleanup completed.',
      canceled: successOrders,
      failed: failedOrders,
    })
  }
  catch (err: any) {
    console.error('Unexpected error:', err.message)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
