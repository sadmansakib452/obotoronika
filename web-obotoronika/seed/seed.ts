import { readFileSync, readdirSync } from 'node:fs'
import { basename, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// ── Load .env ────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '..', '.env') })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const mediaUrl = process.env.MEDIA_URL!

if (!supabaseUrl || !supabaseKey || !mediaUrl) {
  console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or MEDIA_URL in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ── Helpers ──────────────────────────────────────────────────────
const seedDir = __dirname
const imageDir = (folder: string) => resolve(seedDir, 'images', folder)

async function uploadImage(filePath: string): Promise<string> {
  const formData = new FormData()
  const buffer = readFileSync(filePath)
  const blob = new Blob([buffer])
  formData.append('file', blob, basename(filePath))

  const res = await fetch(`${mediaUrl}/api/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Upload failed for ${filePath}: ${res.statusText}`)
  }

  const json = await res.json() as { success: boolean, url: string }
  if (!json.success) throw new Error(`Upload failed: ${JSON.stringify(json)}`)
  return json.url
}

async function uploadAll(folder: string): Promise<Record<string, string>> {
  const dir = imageDir(folder)
  const files = readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  const urls: Record<string, string> = {}

  for (const file of files) {
    const slug = basename(file, extname(file))
    console.log(`  Uploading: ${folder}/${file}`)
    urls[slug] = await uploadImage(resolve(dir, file))
  }

  return urls
}

function getImg(map: Record<string, string>, key: string): string {
  const val = map[key]
  if (!val) throw new Error(`Image not found: ${key}`)
  return val
}

// ── Main ─────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting seed...\n')

  // ═══ Step 1: Upload all images ══════════════════════════════════
  console.log('📸 Uploading images to media worker...')
  const [categoriesImg, productsImg, bannersImg, merchantImg] = await Promise.all([
    uploadAll('categories'),
    uploadAll('products'),
    uploadAll('banners'),
    uploadAll('merchant'),
  ])
  console.log('✅ Images uploaded\n')

  // ═══ Step 2: Create admin user ══════════════════════════════════
  console.log('👤 Creating admin user...')
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@obotoronika.com'
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123'

  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const adminExists = existingUsers?.users?.find(u => u.email === adminEmail)

  let adminUserId: string
  if (!adminExists) {
    const { data: admin, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: 'super_admin', status: 'active', name: 'Super Admin', avatar_url: '' },
    })
    if (error) throw new Error(`Admin create failed: ${error.message}`)
    adminUserId = admin.user!.id
  }
  else {
    adminUserId = adminExists.id
  }

  await supabase.auth.admin.updateUserById(adminUserId, {
    role: 'super_admin',
    user_metadata: { role: 'super_admin', status: 'active', name: 'Super Admin' },
  })
  console.log(`✅ Admin: ${adminEmail}\n`)

  // ═══ Step 3: Create merchant user + merchant ════════════════════
  console.log('🏪 Creating merchant...')
  const merchantEmail = 'merchant@obotoronika.com'
  const merchantPassword = 'merchant123'

  const merchantUserExists = existingUsers?.users?.find(u => u.email === merchantEmail)
  let merchantUserId: string

  if (!merchantUserExists) {
    const { data: sellerUser, error } = await supabase.auth.admin.createUser({
      email: merchantEmail,
      password: merchantPassword,
      email_confirm: true,
      user_metadata: { role: 'seller', status: 'active', name: 'Obotoronika Store', avatar_url: '' },
    })
    if (error) throw new Error(`Merchant user create failed: ${error.message}`)
    merchantUserId = sellerUser.user!.id
  }
  else {
    merchantUserId = merchantUserExists.id
  }

  const { data: existingMerchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', merchantUserId)
    .maybeSingle()

  let merchantId: number
  if (!existingMerchant) {
    const { data: merchant, error } = await supabase
      .from('merchants')
      .insert({
        user_id: merchantUserId,
        name: 'Obotoronika Store',
        description: 'Official Obotoronika merchant store — electronics, fashion, home & kitchen.',
        logo: merchantImg['logo'] || null,
        website: process.env.BASE_URL || 'http://localhost:3000',
        status: 'active',
      })
      .select('id')
      .single()

    if (error) throw new Error(`Merchant insert failed: ${error.message}`)
    merchantId = merchant.id
  }
  else {
    merchantId = existingMerchant.id
  }
  console.log(`✅ Merchant #${merchantId}\n`)

  // ═══ Step 4: Categories ═════════════════════════════════════════
  console.log('📂 Creating categories...')

  const categoryDefs = [
    {
      slug: 'electronics', name: 'Electronics',
      description: 'Smartphones, gadgets, accessories & more',
      thumbnail: categoriesImg['electronics'],
      children: [
        { slug: 'smartphones', name: 'Smartphones', description: 'Latest smartphones & accessories' },
        { slug: 'audio', name: 'Audio & Earphones', description: 'Bluetooth earphones, headphones' },
        { slug: 'accessories', name: 'Accessories', description: 'Chargers, cables, power banks' },
      ],
    },
    {
      slug: 'fashion', name: 'Fashion',
      description: 'Clothing, shoes, watches & accessories',
      thumbnail: categoriesImg['fashion'],
      children: [
        { slug: 'men-clothing', name: `Men's Clothing`, description: 'Panjabi, t-shirts & more' },
        { slug: 'footwear', name: 'Footwear', description: 'Sneakers, sandals & shoes' },
        { slug: 'watches', name: 'Watches', description: 'Stylish wrist watches for men' },
      ],
    },
    {
      slug: 'home-kitchen', name: 'Home & Kitchen',
      description: 'Kitchen appliances, cookware & dining',
      thumbnail: categoriesImg['home-kitchen'],
      children: [
        { slug: 'kitchen-appliances', name: 'Kitchen Appliances', description: 'Rice cookers, blenders & more' },
        { slug: 'cookware', name: 'Cookware', description: 'Pressure cookers, pans & pots' },
        { slug: 'dining', name: 'Dining', description: 'Dinner sets, plates & utensils' },
      ],
    },
    {
      slug: 'groceries', name: 'Groceries',
      description: 'Rice, oil, honey, dates & daily essentials',
      thumbnail: categoriesImg['groceries'],
      children: [
        { slug: 'rice-grains', name: 'Rice & Grains', description: 'Premium basmati rice & grains' },
        { slug: 'oils', name: 'Cooking Oils', description: 'Mustard oil & cooking essentials' },
        { slug: 'organic', name: 'Organic & Natural', description: 'Honey, dates & natural products' },
      ],
    },
    {
      slug: 'beauty', name: 'Beauty',
      description: 'Skincare, haircare, perfume & cosmetics',
      thumbnail: categoriesImg['beauty'],
      children: [
        { slug: 'skincare', name: 'Skincare', description: 'Face creams & moisturizers' },
        { slug: 'haircare', name: 'Haircare', description: 'Shampoo & hair products' },
        { slug: 'fragrance', name: 'Fragrance & Cosmetics', description: 'Perfume, lipstick & beauty' },
      ],
    },
    {
      slug: 'sports', name: 'Sports',
      description: 'Sports equipment, gear & accessories',
      thumbnail: categoriesImg['sports'],
      children: [],
    },
  ]

  const categoryMap: Record<string, number> = {}

  async function upsertCategory(slug: string, name: string, description: string, thumbnail: string, parentId?: number): Promise<number> {
    // Check if exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      await supabase.from('categories').update({ name, description, thumbnail, parent_id: parentId || null, is_active: true }).eq('id', existing.id)
      return existing.id
    }

    const { data: created } = await supabase
      .from('categories')
      .insert({ slug, name, description, thumbnail, parent_id: parentId || null, is_active: true })
      .select('id')
      .single()

    if (!created) throw new Error(`Category ${slug} insert failed`)
    return created.id
  }

  for (const cat of categoryDefs) {
    const parentId = await upsertCategory(cat.slug, cat.name, cat.description, cat.thumbnail!)
    categoryMap[cat.slug] = parentId
    console.log(`  📁 ${cat.name} #${parentId}`)

    for (const child of cat.children) {
      const childId = await upsertCategory(child.slug, child.name, child.description, cat.thumbnail!, parentId)
      categoryMap[child.slug] = childId
      console.log(`    └ ${child.name} #${childId}`)
    }
  }
  console.log('✅ Categories done\n')

  // ═══ Step 5: Sections ═══════════════════════════════════════════
  console.log('📦 Creating sections...')

  const sectionDefs = [
    { slug: 'featured', title: 'Featured Products', description: 'Handpicked products curated for you', position: 1 },
    { slug: 'new-arrivals', title: 'New Arrivals', description: 'Fresh products just landed', position: 2 },
    { slug: 'best-sellers', title: 'Best Sellers', description: 'Most popular products this week', position: 3 },
    { slug: 'electronics-section', title: 'Electronics Deals', description: 'Best deals on electronics & gadgets', position: 4 },
    { slug: 'fashion-section', title: 'Fashion Trends', description: 'Latest fashion & style picks', position: 5 },
    { slug: 'home-section', title: 'Home Essentials', description: 'Kitchen, dining & home must-haves', position: 6 },
  ]

  const sectionMap: Record<string, number> = {}
  for (const sec of sectionDefs) {
    const { data } = await supabase
      .from('sections')
      .upsert({
        slug: sec.slug,
        title: sec.title,
        description: sec.description,
        status: 'active',
        active_position: sec.position,
      }, { onConflict: 'slug' })
      .select('id')
      .single()

    if (!data) throw new Error(`Section ${sec.slug} upsert failed`)
    sectionMap[sec.slug] = data.id
    console.log(`  📦 ${sec.title} #${data.id}`)
  }
  console.log('✅ Sections done\n')

  // ═══ Step 6: Products ═══════════════════════════════════════════
  console.log('🛍️  Creating products...')

  const products = [
    { title: 'Galaxy S25 Ultra 5G Smartphone', slug: 'galaxy-s25-ultra', description: 'Latest Samsung Galaxy S25 Ultra with 200MP camera, 12GB RAM, 256GB storage. Bangladesh official warranty included.', price: 159990, offer_price: 152990, category: 'smartphones', section: 'electronics-section', stock: 50, brand: 'Samsung', thumbnail: getImg(productsImg, 'smartphone') },
    { title: 'Premium Bluetooth Wireless Earphone', slug: 'bluetooth-earphone-pro', description: 'Hi-Fi sound quality Bluetooth 5.3 earphone with 40hr battery life, IPX7 waterproof, active noise cancellation.', price: 2490, offer_price: 1990, category: 'audio', section: 'electronics-section', stock: 120, brand: 'Xiaomi', thumbnail: getImg(productsImg, 'earphone') },
    { title: '20000mAh Fast Charging Power Bank', slug: 'power-bank-20000', description: '20000mAh high capacity power bank with 22.5W fast charging, dual USB output, LED indicator.', price: 1890, offer_price: 1490, category: 'accessories', section: 'electronics-section', stock: 85, brand: 'Anker', thumbnail: getImg(productsImg, 'powerbank') },
    { title: 'Type-C Fast Charging USB Cable 1.5m', slug: 'usb-type-c-cable', description: 'Durable braided Type-C fast charging cable, 1.5m length, supports 65W charging.', price: 390, offer_price: 290, category: 'accessories', section: 'electronics-section', stock: 200, brand: 'Baseus', thumbnail: getImg(productsImg, 'usb-cable') },
    { title: 'Mens Premium Cotton Panjabi', slug: 'mens-premium-panjabi', description: 'Premium cotton panjabi for men, perfect for Eid, weddings & festivals. Bangladeshi made.', price: 2490, offer_price: 1990, category: 'men-clothing', section: 'fashion-section', stock: 65, brand: 'Aarong', thumbnail: getImg(productsImg, 'panjabi') },
    { title: 'Mens Casual Cotton Round Neck T-Shirt', slug: 'mens-cotton-tshirt', description: '100% cotton t-shirt, comfortable fit, machine washable. Available in 6 colors.', price: 690, offer_price: 550, category: 'men-clothing', section: 'fashion-section', stock: 150, brand: 'Ecstasy', thumbnail: getImg(productsImg, 'tshirt') },
    { title: 'Mens Trendy Casual Sneakers', slug: 'trendy-casual-sneakers', description: 'Lightweight casual sneakers with memory foam insole. Breathable mesh upper.', price: 2990, offer_price: 2490, category: 'footwear', section: 'fashion-section', stock: 40, brand: 'Apex', thumbnail: getImg(productsImg, 'sneakers') },
    { title: 'Stainless Steel Chronograph Watch', slug: 'chronograph-watch', description: 'Premium stainless steel watch with chronograph, date display, 30m water resistance.', price: 3490, offer_price: 2990, category: 'watches', section: 'fashion-section', stock: 35, brand: 'Casio', thumbnail: getImg(productsImg, 'watch') },
    { title: '1.8L Automatic Rice Cooker', slug: 'automatic-rice-cooker-18l', description: '1.8L capacity automatic rice cooker with keep-warm function. Non-stick inner pot.', price: 2490, offer_price: 1990, category: 'kitchen-appliances', section: 'home-section', stock: 55, brand: 'Miyako', thumbnail: getImg(productsImg, 'rice-cooker') },
    { title: '1500W High Speed Blender', slug: 'high-speed-blender-1500w', description: 'Powerful 1500W blender with 2L glass jar, stainless steel blades. 2-year warranty.', price: 3490, offer_price: 2990, category: 'kitchen-appliances', section: 'home-section', stock: 30, brand: 'Philips', thumbnail: getImg(productsImg, 'blender') },
    { title: '5L Stainless Steel Pressure Cooker', slug: 'stainless-pressure-cooker-5l', description: 'Heavy-duty 5L stainless steel pressure cooker with safety valve. Induction compatible.', price: 3290, offer_price: 2790, category: 'cookware', section: 'home-section', stock: 45, brand: 'Prestige', thumbnail: getImg(productsImg, 'pressure-cooker') },
    { title: '32-Piece Ceramic Dinner Set', slug: 'ceramic-dinner-set-32pc', description: 'Elegant 32-piece ceramic dinner set for 6 persons. Microwave & dishwasher safe.', price: 4490, offer_price: 3990, category: 'dining', section: 'home-section', stock: 25, brand: 'Monno', thumbnail: getImg(productsImg, 'dinner-set') },
    { title: 'Premium Basmati Rice 5kg', slug: 'premium-basmati-rice-5kg', description: 'Premium quality basmati rice, long grain, aromatic. 5kg pack. Perfect for biryani & pulao.', price: 850, offer_price: 750, category: 'rice-grains', section: 'featured', stock: 200, brand: 'Chinigura', thumbnail: getImg(productsImg, 'basmati-rice') },
    { title: 'Pure Mustard Cooking Oil 2L', slug: 'pure-mustard-oil-2l', description: '100% pure cold-pressed mustard oil, 2 liters. Traditional Bangladeshi cooking oil.', price: 580, offer_price: 520, category: 'oils', section: 'featured', stock: 150, brand: 'Teer', thumbnail: getImg(productsImg, 'mustard-oil') },
    { title: 'Natural Pure Honey 500g', slug: 'natural-pure-honey-500g', description: '100% pure natural honey from Sundarbans, 500g glass jar. No added sugar or preservatives.', price: 550, offer_price: 480, category: 'organic', section: 'featured', stock: 100, brand: 'ACI', thumbnail: getImg(productsImg, 'honey') },
    { title: 'Premium Medjool Dates 1kg', slug: 'premium-medjool-dates-1kg', description: 'Premium imported Medjool dates, 1kg pack. Soft, sweet & rich in nutrients.', price: 1200, offer_price: 990, category: 'organic', section: 'featured', stock: 80, brand: 'Mabroom', thumbnail: getImg(productsImg, 'dates') },
    { title: 'Vitamin C Brightening Face Cream 50ml', slug: 'vitamin-c-face-cream', description: 'Vitamin C enriched brightening face cream with SPF 30. Reduces dark spots.', price: 790, offer_price: 650, category: 'skincare', section: 'new-arrivals', stock: 90, brand: 'Ponds', thumbnail: getImg(productsImg, 'face-cream') },
    { title: 'Anti-Dandruff Herbal Shampoo 400ml', slug: 'anti-dandruff-shampoo-400ml', description: 'Herbal anti-dandruff shampoo with neem & aloe vera. Strengthens hair, reduces hair fall.', price: 490, offer_price: 390, category: 'haircare', section: 'new-arrivals', stock: 110, brand: 'Sunsilk', thumbnail: getImg(productsImg, 'shampoo') },
    { title: 'Luxury Oud Perfume 100ml', slug: 'luxury-oud-perfume-100ml', description: 'Premium oud perfume for men & women, 100ml EDP. Long lasting 8hr+ scent.', price: 1890, offer_price: 1590, category: 'fragrance', section: 'new-arrivals', stock: 60, brand: 'Al Haramain', thumbnail: getImg(productsImg, 'perfume') },
    { title: 'Matte Liquid Lipstick 5ml', slug: 'matte-liquid-lipstick', description: 'Long lasting matte liquid lipstick, 5ml. Smudge proof, waterproof, 12hr wear.', price: 550, offer_price: 450, category: 'fragrance', section: 'new-arrivals', stock: 130, brand: 'MAC', thumbnail: getImg(productsImg, 'lipstick') },
  ]

  for (const p of products) {
    const visibility: Record<string, string> = {}
    visibility[p.section] = 'true'
    visibility['featured'] = 'false'
    visibility['new-arrivals'] = 'false'
    visibility['best-sellers'] = 'true'
    visibility['electronics-section'] = 'false'
    visibility['fashion-section'] = 'false'
    visibility['home-section'] = 'false'
    visibility[p.section] = 'true'

    const { error } = await supabase
      .from('products')
      .upsert({
        merchant_id: merchantId,
        category_id: categoryMap[p.category],
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: p.price,
        offer_price: p.offer_price,
        thumbnail: p.thumbnail,
        files: [p.thumbnail],
        status: 'published',
        current_stock: p.stock,
        initial_stock: p.stock,
        track_inventory: true,
        availability: 'in_stock',
        brand: p.brand,
        tags: [p.category, p.brand, p.section].filter(Boolean),
        product_visibility: visibility,
        page_title: `Buy ${p.title} Online in Bangladesh | Obotoronika`,
        meta_description: `${p.title} in Bangladesh. Best price ${p.offer_price} BDT. Free delivery.`,
        meta_keywords: [p.category, 'bangladesh', 'online shopping', 'best price'].filter(Boolean),
      }, { onConflict: 'slug' })

    if (error) {
      console.error(`  ❌ Failed: ${p.title}: ${error.message}`)
      throw error
    }
    console.log(`  🛍️  ${p.title}`)
  }
  console.log(`✅ ${products.length} products done\n`)

  // ═══ Step 7: Banners ═══════════════════════════════════════════
  console.log('🎨 Creating banners...')

  const bannerDefs = [
    {
      image_url: bannersImg['banner-1'],
      title: 'Electronics Mega Sale!',
      description: 'Up to 30% off on smartphones, earphones & gadgets',
      button_text: 'Shop Electronics',
      button_link: '/sections/electronics',
      section_id: sectionMap['electronics-section'],
      display_order: 1,
    },
    {
      image_url: bannersImg['banner-2'],
      title: 'Eid Collection 2025',
      description: 'Exclusive panjabi, t-shirts & fashion deals',
      button_text: 'Explore Fashion',
      button_link: '/sections/fashion',
      section_id: sectionMap['fashion-section'],
      display_order: 2,
    },
    {
      image_url: bannersImg['banner-3'],
      title: 'Home & Kitchen Essentials',
      description: 'Rice cooker, blender, cookware at best prices',
      button_text: 'Shop Home',
      button_link: '/sections/home-kitchen',
      section_id: sectionMap['home-section'],
      display_order: 3,
    },
  ]

  for (const b of bannerDefs) {
    const { error } = await supabase.from('banners').upsert({
      image_url: b.image_url!,
      title: b.title,
      description: b.description,
      button_text: b.button_text,
      button_link: b.button_link,
      section_id: b.section_id,
      display_order: b.display_order,
      status: 'active',
    })

    if (error) {
      console.error(`  ❌ Banner failed: ${error.message}`)
      throw error
    }
    console.log(`  🎨 ${b.title}`)
  }
  console.log('✅ Banners done\n')

  // ═══ Done ══════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🌱 Seed complete!')
  console.log('')
  console.log(`  Admin:    ${adminEmail} / ${adminPassword}`)
  console.log(`  Merchant: ${merchantEmail} / ${merchantPassword}`)
  console.log(`  Products: ${products.length}`)
  console.log(`  Categories: ${Object.keys(categoryMap).length}`)
  console.log(`  Sections: ${Object.keys(sectionMap).length}`)
  console.log(`  Banners: ${bannerDefs.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err)
  process.exit(1)
})
