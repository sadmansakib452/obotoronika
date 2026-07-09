import { faker } from '@faker-js/faker'

const ladiesGarments = [
  'Anarkali Dress', 'A-Line Kurti', 'Blouse', 'Chanderi Saree',
  'Chikankari Kurta', 'Churidar Suit', 'Cold Shoulder Top',
  'Cotton Kurti', 'Crop Top', 'Denim Jacket', 'Designer Saree',
  'Dhoti Pants', 'Dupatta', 'Embroidered Kurti', 'Flared Palazzo',
  'Floral Maxi Dress', 'Georgette Saree', 'Gown', 'Halter Neck Top',
  'Handloom Saree', 'High Low Kurti', 'Indo-Western Gown',
  'Jacket Kurti', 'Jumpsuit', 'Kaftan', 'Kalamkari Kurti',
  'Knee-Length Dress', 'Kurta with Sharara', 'Kurta with Palazzo',
  'Lace Top', 'Lehenga Choli', 'Long Skirt', 'Maxi Dress',
  'Net Saree', 'Off-Shoulder Top', 'One Piece Dress', 'Pakistani Suit',
  'Patiala Suit', 'Peplum Kurti', 'Printed Palazzo', 'Printed Saree',
  'Salwar Kameez', 'Saree Blouse', 'Sharara Set', 'Short Kurti',
  'Silk Saree', 'Skater Dress', 'Stylish Kurti', 'Tunic Dress',
  'Wrap Dress',
]

export default defineEventHandler(async (event) => {
  try {
    // 1. Auth guard
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['super_admin', 'admin'])

    // 2. Parse query params
    const query = getQuery(event)
    const count = Math.min(Math.max(Number(query.count) || 50, 1), 100)
    const preferredMerchantId = query.merchant_id ? Number(query.merchant_id) : null
    const preferredCategoryId = query.category_id ? Number(query.category_id) : null

    // 3. Resolve category_id
    let categoryId = preferredCategoryId

    if (!categoryId) {
      const { data: categories } = await supabaseAdmin
        .from('categories')
        .select('id')
        .limit(1)

      if (categories?.length) {
        categoryId = categories[0].id
      }
      else {
        const { data: newCategory, error: catError } = await supabaseAdmin
          .from('categories')
          .insert({ name: 'Demo Category', slug: 'demo-category' })
          .select('id')
          .single()

        if (catError || !newCategory) {
          throw createError({
            statusCode: 500,
            message: `Failed to create demo category: ${catError?.message || 'Unknown error'}`,
          })
        }

        categoryId = newCategory.id
      }
    }

    // 4. Resolve merchant_id
    let merchantId = preferredMerchantId

    if (!merchantId) {
      const { data: merchants } = await supabaseAdmin
        .from('merchants')
        .select('id')
        .limit(1)

      if (merchants?.length) {
        merchantId = merchants[0].id
      }
      else {
        const userId = user.id || user.user_metadata?.sub

        if (!userId) {
          throw createError({
            statusCode: 400,
            message: 'Could not determine user ID to create a demo merchant.',
          })
        }

        const { data: newMerchant, error: merchError } = await supabaseAdmin
          .from('merchants')
          .insert({
            user_id: userId,
            name: 'Fake Merchant',
            status: 'active',
          })
          .select('id')
          .single()

        if (merchError || !newMerchant) {
          throw createError({
            statusCode: 500,
            message: `Failed to create demo merchant: ${merchError?.message || 'Unknown error'}`,
          })
        }

        merchantId = newMerchant.id
      }
    }

    // 5. Generate fake products
    const products = Array.from({ length: count }, () => {
      const price = faker.number.float({ min: 10, max: 1000, fractionDigits: 2 })
      const offerPrice = faker.number.float({ min: 5, max: price - 1, fractionDigits: 2 })
      const initialStock = faker.number.int({ min: 50, max: 300 })
      const currentStock = faker.number.int({ min: 0, max: initialStock })

      return {
        id: faker.string.uuid(),
        category_id: categoryId,
        merchant_id: merchantId,
        title: faker.helpers.arrayElement(ladiesGarments),
        description: faker.commerce.productDescription(),
        sku: faker.string.alphanumeric(10).toUpperCase(),
        price,
        offer_price: offerPrice,
        cost_price: faker.number.float({ min: 5, max: offerPrice - 1, fractionDigits: 2 }),
        initial_stock: initialStock,
        current_stock: currentStock,
        low_stock_alert: faker.number.int({ min: 10, max: 40 }),
        availability: 'in_stock',
        brand: faker.company.name(),
        tags: faker.helpers.arrayElements(['women', 'fashion', 'garments'], 2),
        slug: faker.helpers.slugify(`${faker.lorem.word()}-${faker.string.alphanumeric(6)}`).toLowerCase(),
        thumbnail: 'https://via.placeholder.com/300',
        status: faker.helpers.arrayElement(['published', 'pending', 'draft']),
        product_visibility: { is_visible: true, show_in_search: true },
        track_inventory: true,
        free_shipping: faker.datatype.boolean(),
        created_at: faker.date.past().toISOString(),
        updated_at: faker.date.recent().toISOString(),
      }
    })

    // 6. Insert into database
    const { error: insertError } = await supabaseAdmin
      .from('products')
      .insert(products)

    if (insertError) {
      throw createError({
        statusCode: 500,
        message: `Failed to insert products: ${insertError.message}`,
      })
    }

    // 7. Return success response
    return successResponse(event, 201, {
      count: products.length,
      merchant_id: merchantId,
      category_id: categoryId,
      products,
    })
  }
  catch (error: any) {
    console.error('Error generating fake products:', error)

    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized. Only admins can generate fake products.')
    }
    if (error?.statusCode === 403) {
      return errorResponse(event, 403, 'Forbidden. You do not have permission.')
    }

    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to generate fake products.',
    )
  }
})
