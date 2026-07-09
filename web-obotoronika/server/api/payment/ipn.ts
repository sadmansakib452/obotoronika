import SSLCommerzPayment from '@@/server/ssl'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'
import { errorResponse } from '~~/server/utils/response'

type SslIpnBody = {
  tran_id?: string
  val_id?: string
  status?: string
  card_issuer?: string
  card_type?: string
  [key: string]: any
}

function mapSslStatusToOrderStatus(statusRaw?: string) {
  const s = String(statusRaw || '').toUpperCase()
  if (s === 'VALID' || s === 'VALIDATED') return 'processing'
  if (s === 'FAILED') return 'failed'
  if (s === 'CANCELLED') return 'canceled'
  return null
}

export default defineEventHandler(async (event) => {
  try {
    if ((event.node.req.method || '').toUpperCase() !== 'POST') {
      return errorResponse(event, 405, 'Method not allowed')
    }

    const config = useRuntimeConfig()
    const store_id = config.STORE_ID
    const store_passwd = config.STORE_PASSWORD
    const is_live = false

    if (!store_id || !store_passwd) {
      return errorResponse(event, 500, 'Payment gateway is not configured')
    }

    const body = (await readBody(event)) as SslIpnBody
    const tran_id = body?.tran_id
    const val_id = body?.val_id
    const ipn_status = body?.status

    if (!tran_id) return errorResponse(event, 400, 'Missing tran_id')

    // IPN hit marker: if you see this log, SSLCommerz successfully reached your server.
    const ip
      = getHeader(event, 'cf-connecting-ip')
        || getHeader(event, 'x-forwarded-for')
        || event.node.req.socket.remoteAddress
        || ''
    console.log('[sslcommerz][ipn] received', {
      tran_id,
      status: ipn_status,
      val_id: val_id ? `${String(val_id).slice(0, 10)}…` : null, // avoid dumping full val_id in logs
      ip,
      at: new Date().toISOString(),
    })

    // Find linked order (transactions.order_id references orders.id)
    const { data: txn, error: txnErr } = await supabaseAdmin
      .from('transactions')
      .select('id, order_id, status')
      .eq('transaction_id', tran_id)
      .single()

    if (txnErr || !txn) return errorResponse(event, 404, 'Transaction not found')

    // Validate with SSLCommerz when val_id exists (more reliable than trusting raw IPN fields)
    let validation: any = null
    if (val_id) {
      try {
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
        validation = await sslcz.validate({ val_id })
      }
      catch (e) {
        // If validation API fails, still store the IPN payload for later inspection.
        validation = { error: 'validation_failed', details: String((e as any)?.message || e) }
      }
    }

    const gatewayStatus = (validation as any)?.status || ipn_status
    const orderStatus = mapSslStatusToOrderStatus(gatewayStatus)

    // Validation outcome marker: helps confirm if validationserverAPI succeeded.
    console.log('[sslcommerz][ipn] status', {
      tran_id,
      gatewayStatus,
      mappedOrderStatus: orderStatus,
      validated: Boolean(val_id && validation && !(validation as any)?.error),
    })

    // Update transaction details (always)
    const payment_method = body?.card_issuer || body?.card_type || null
    const updateTxnPayload: Record<string, any> = {
      payment_method,
      payment_details: {
        ipn: body,
        validation,
      },
      status: gatewayStatus || txn.status || 'pending',
      updated_at: new Date().toISOString(),
    }

    const { error: updTxnErr } = await supabaseAdmin
      .from('transactions')
      .update(updateTxnPayload)
      .eq('id', txn.id)

    if (updTxnErr) return errorResponse(event, 500, updTxnErr.message)

    // Transaction update marker: indicates DB update succeeded.
    console.log('[sslcommerz][ipn] transaction updated', {
      tran_id,
      transaction_row_id: txn.id,
      order_id: txn.order_id,
      status: updateTxnPayload.status,
    })

    // Update order + merchant_orders status only when we have a clear terminal status
    if (orderStatus) {
      // Only move forward from pending/awaiting_payment to avoid clobbering shipped/delivered/etc.
      const { data: orderRow } = await supabaseAdmin
        .from('orders')
        .select('id, status, user_id')
        .eq('id', txn.order_id)
        .single()

      const currentStatus = orderRow?.status as string | undefined
      const canUpdate = currentStatus === 'pending' || currentStatus === 'awaiting_payment'
      if (canUpdate) {
        const { error: updOrderErr } = await supabaseAdmin
          .from('orders')
          .update({ status: orderStatus, payment_method, updated_at: new Date().toISOString() })
          .eq('id', txn.order_id)

        if (updOrderErr) return errorResponse(event, 500, updOrderErr.message)

        // Keep merchant sub-orders in sync
        const { error: updMerchantErr } = await supabaseAdmin
          .from('merchant_orders')
          .update({ status: orderStatus, updated_at: new Date().toISOString() })
          .eq('order_id', txn.order_id)

        if (updMerchantErr) return errorResponse(event, 500, updMerchantErr.message)

        // Order status update marker: this tells you IPN changed the order state.
        console.log('[sslcommerz][ipn] order status updated', {
          order_id: txn.order_id,
          from: currentStatus,
          to: orderStatus,
        })

        // Clear purchased items from the cart after payment is confirmed.
        // We do this on IPN VALID/VALIDATED so carts are not lost on failed/canceled payments.
        if (orderStatus === 'processing' && orderRow?.user_id) {
          try {
            const { data: items, error: itemsErr } = await supabaseAdmin
              .from('order_items')
              .select('product_id, variants')
              .eq('order_id', txn.order_id)

            if (itemsErr) {
              console.error('[sslcommerz][ipn] cart clear: failed to load order_items', {
                order_id: txn.order_id,
                error: itemsErr.message,
              })
            }
            else if (items?.length) {
              let deleted = 0
              for (const item of items) {
                const { error: delErr } = await supabaseAdmin
                  .from('cart_items')
                  .delete()
                  .eq('user_id', orderRow.user_id)
                  .eq('product_id', item.product_id)
                  // Match the exact product+variants combo (cart supports same product with different variants).
                  .eq('variants', JSON.stringify(item.variants ?? []))
                if (!delErr) deleted++
                else {
                  console.error('[sslcommerz][ipn] cart clear: delete failed', {
                    user_id: orderRow.user_id,
                    product_id: item.product_id,
                    error: delErr.message,
                  })
                }
              }
              console.log('[sslcommerz][ipn] cart cleared', {
                order_id: txn.order_id,
                user_id: orderRow.user_id,
                deleted_items: deleted,
              })
            }
          }
          catch (e: any) {
            // Never fail IPN response if cart cleanup fails; payment is already confirmed.
            console.error('[sslcommerz][ipn] cart clear: unexpected error', {
              order_id: txn.order_id,
              error: String(e?.message || e),
            })
          }
        }
      }
    }

    // SSLCommerz expects HTTP 200 quickly.
    return successResponse(event, 200, { ok: true })
  }
  catch (error: any) {
    console.error('Error in IPN handler:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
