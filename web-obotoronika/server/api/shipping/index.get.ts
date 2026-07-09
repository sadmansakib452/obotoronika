import { createError, getQuery } from 'h3'
import { parseNestedQuery } from '@@/shared/utils/queryParamUtils'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event) => {
  try {
    // Initialize Supabase client
    const supabase = await getServerSupabase(event)
    const query = getQuery(event)
    const items = parseNestedQuery(typeof query?.products === 'string' ? query.products : '')

    // Check user role
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'customer'])

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(event, 400, 'No items provided in query 11')
    }

    // Validate item structure
    for (const [index, item] of items.entries()) {
      if (!item.id || !item.quantity) {
        return errorResponse(event, 400, `Invalid item at index ${index}: missing id or quantity`)
      }
      if (isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0) {
        return errorResponse(event, 400, `Invalid quantity at index ${index}: must be a positive number`)
      }
    }

    // Fetch product details from Supabase
    const productIds = items.map(item => item.id)
    const { data: products, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, title, price, current_stock, thumbnail, offer_price')
      .in('id', productIds)

    if (productError) {
      console.error('Supabase product fetch error:', productError)
      return errorResponse(event, 500, 'Failed to fetch product details')
    }

    if (!products || products.length === 0) {
      return errorResponse(event, 404, 'No products found for the provided IDs')
    }

    // Map items to include product details
    const checkoutItems = items.map((item) => {
      const product = products.find(p => p.id === item.id)
      if (!product) {
        throw createError({ statusCode: 404, statusMessage: `Product with ID ${item.id} not found` })
      }
      if (product.current_stock < parseInt(item.quantity)) {
        throw createError({ statusCode: 400, statusMessage: `Insufficient stock for product ${product.title}` })
      }
      return {
        id: item.id,
        title: product.title,
        price: product.offer_price ?? product.price,
        offer_price: product.offer_price,
        quantity: parseInt(item.quantity),
        thumbnail: product.thumbnail,
        variants: JSON.parse(item.variants),
        total: (product.offer_price ?? product.price) * parseInt(item.quantity),
        merchant_id: item.merchant_id,
      }
    })

    // Calculate total
    const total = checkoutItems.reduce((sum, item) => sum + item.total, 0)

    return successResponse(event, 200, {
      products: checkoutItems,
      total,
      items,
    })
  }
  catch (error: any) {
    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized')
    }
    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }
    if (error?.statusCode === 400 || error?.statusCode === 404) {
      return errorResponse(event, error.statusCode, error.message)
    }
    console.error('Error in checkout route:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
