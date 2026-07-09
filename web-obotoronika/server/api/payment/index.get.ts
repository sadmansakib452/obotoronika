import SSLCommerzPayment from '@@/server/ssl'

const config = useRuntimeConfig()
const store_id = config.STORE_ID
const store_passwd = config.STORE_PASSWORD
const is_live = false

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const order_id = query.order_id as string

    if (!order_id) return errorResponse(event, 400, 'Missing order_id')

    if (!store_id || !store_passwd) {
      return errorResponse(event, 500, 'Payment gateway is not configured')
    }

    const headerProto = getHeader(event, 'x-forwarded-proto') || 'http'
    const headerHost = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
    const requestBaseUrl = headerHost ? `${headerProto}://${headerHost}` : undefined
    const baseUrl = (config.baseUrl as string | undefined)?.trim() || requestBaseUrl

    if (!baseUrl) {
      return errorResponse(event, 500, 'Missing BASE_URL configuration')
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, transaction:transactions(transaction_id), user:extended_users(raw_user_meta_data->>name, phone, email)')
      .eq('order_id', order_id)
      .single()

    if (error) throw Error(error.message)

    const tran_id = Array.isArray(data?.transaction)
      ? data.transaction[0]?.transaction_id
      : data?.transaction?.transaction_id

    if (!tran_id) {
      return errorResponse(event, 400, 'Transaction not found for this order')
    }

    const user = data?.user ?? {}
    const shipping = data?.shipping_address ?? {}

    if (!shipping?.address || !shipping?.city || !shipping?.region) {
      return errorResponse(event, 400, 'Shipping address is incomplete')
    }

    const payload = {
      total_amount: data.total_amount,
      currency: 'BDT',
      tran_id,
      success_url: `${baseUrl}/order-received`,
      fail_url: `${baseUrl}/fail`,
      cancel_url: `${baseUrl}/cancel`,
      ipn_url: `${baseUrl}/api/payment/ipn`,
      shipping_method: 'Courier',
      val_id: '',
      num_of_item: 1,
      product_name: data.order_id,
      // The SSLCommerz helper expects `productcategory` (not `product_category`)
      productcategory: data.order_id,
      product_profile: data.order_id,
      cus_name: user?.name ?? '',
      cus_email: user?.email ?? '',
      cus_phone: user?.phone ?? '',
      cus_add1: shipping.address,
      // cus_add2: 'Dhaka',
      cus_city: shipping.city,
      cus_state: shipping.region,
      cus_postcode: shipping.postcode ?? shipping.city,
      cus_country: 'Bangladesh',
      ship_name: shipping.name ?? user?.name ?? '',
      ship_add1: shipping.address,
      ship_add2: '',
      shipcity: shipping.city,
      ship_city: shipping.city,
      ship_state: shipping.region,
      ship_postcode: shipping.postcode ?? shipping.city,
      ship_country: 'Bangladesh',
    }

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    const apiResponse = await sslcz.init(payload)

    if (apiResponse.status === 'SUCCESS') {
      const targets = new Set(['bkash', 'nagad', 'dbblmobilebanking'])

      const result = apiResponse.desc.reduce((acc: any, item: any) => {
        if (targets.has(item.gw)) {
          acc[item.gw] = item
        }
        return acc
      }, {})

      return successResponse(event, 200, result)
    }
    else {
      throw Error(apiResponse.failedreason)
    }
  }
  catch (error: any) {
    if (error?.statusCode === 401) return errorResponse(event, 401, 'Unauthorized')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error creating payment link:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
