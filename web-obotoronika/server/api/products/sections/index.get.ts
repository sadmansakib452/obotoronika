export default defineEventHandler(async (event) => {
  try {
    // Fetch sections with only required columns
    const { data: sections, error: sectionsError } = await supabaseAdmin
      .from('sections')
      .select('id, title, slug, description')
      .eq('status', 'active')
      .order('active_position', { ascending: true })

    if (sectionsError) throw sectionsError

    if (!sections || sections.length === 0) {
      return successResponse(event, 200, { sections: [] })
    }

    // Fetch all products visible in any section in a single query
    const slugs = sections.map(section => section.slug)
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, description, price, thumbnail, slug, product_visibility, offer_price') // Fetch only required columns
      .or(slugs.map(slug => `product_visibility->>${slug}.eq.true`).join(','))
      .eq('status', 'published')
      .order('created_at', { ascending: false }) // Optional: Order products by ID or any other criteria

    if (productsError) throw productsError

    // Group products by section slug and limit to 10 items per section
    const productsBySlug = products.reduce((acc, product) => {
      Object.entries(product.product_visibility || {}).forEach(([slug, isVisible]) => {
        if (isVisible && slugs.includes(slug)) {
          if (!acc[slug]) acc[slug] = { products: [], total: 0 }
          acc[slug].products.push(product)
          acc[slug].total++
        }
      })
      return acc
    }, {} as Record<string, { products: any[], total: number }>)

    // Attach products to sections, add `has_more` key, and filter out sections with no products
    const sectionsWithProducts = sections
      .map((section) => {
        const sectionProducts = productsBySlug[section.slug]?.products || []
        const totalProducts = productsBySlug[section.slug]?.total || 0

        return {
          ...section,
          products: sectionProducts.slice(0, 10), // Limit to 10 products
          has_more: totalProducts > 10, // Add `has_more` key
        }
      })
      .filter(section => section.products.length > 0)

    return successResponse(event, 200, {
      sections: sectionsWithProducts,
    }) as unknown as SuccessResponse<typeof sectionsWithProducts>
  }
  catch (error: any) {
    console.error('Error in get home page sections with products:', error)
    return errorResponse(event, 500, error?.message)
  }
})
