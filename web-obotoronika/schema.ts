import { relations } from 'drizzle-orm'
import { pgTable, text, integer, uuid, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  avatar: text('avatar'),
  email: text('email').unique(),
  phone: text('phone').unique(),
  password: text('password'),
  address: text('address'),
  role: text('role', {
    enum: ['super_admin', 'admin', 'manager', 'customer', 'seller'],
  }).default('customer'),
  status: text('status', {
    enum: ['active', 'inactive', 'suspended', 'banned'],
  }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const emailVerifications = pgTable('email_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  emailOrPhone: text('email_or_phone').unique().notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const merchants = pgTable('merchants', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').unique().notNull().references(() => users.id),
  name: text('name').unique().notNull(),
  address: text('address').notNull(),
  logo: text('logo'),
  description: text('description'),
  website: text('website').unique(),
  status: text('status', {
    enum: ['active', 'inactive', 'suspended', 'banned'],
  }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description'),
  slug: text('slug').unique().notNull(),
  thumbnail: text('thumbnail').unique().notNull(),
  parentId: uuid('parent_id'), // Define without direct reference
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
} as const)

// Define the parent-child relationship separately
export const categoriesRelations = relations(categories, ({ one }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
}))

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  merchant_id: uuid('merchant_id').notNull().references(() => merchants.id),
  name: text('name').notNull(),
  description: text('description'),
  category: uuid('category').notNull().references(() => categories.id),
  sku: text('sku'),
  files: text('files'),
  price: integer('price').notNull(),
  constPrice: integer('const_price'),
  retailPrice: integer('retail_price'),
  salePrice: integer('sale_price'),
  trackInventory: boolean('track_inventory'),
  initialStockLevel: integer('initial_stock_level').default(0).notNull(),
  currentStockLevel: integer('current_stock_level').default(0),
  lowStockLevel: integer('low_stock_level').default(0).notNull(),
  availability: text('availability', {
    enum: ['available', 'coming-soon'],
  }).notNull(),
  globalTradeNumber: text('global_trade_number'),
  manufacturerNumber: text('manufacturer_number'),
  brandName: text('brand_name'),
  itemUPC: text('item_upc'),
  customFields: jsonb('custom_fields'),
  freeShipping: boolean('free_shipping').default(false),
  shippingPrice: integer('shipping_price'),
  locationBasedShipping: boolean('location_based_shipping').default(true),
  locationBasedShippingPrice: jsonb('location_based_shipping_price'),
  availableDate: timestamp('available_date'),
  endDate: timestamp('end_date'),
  variants: jsonb('variants'),
  tags: text('tags'),
  pageTitle: text('page_title'),
  metaKeywords: text('meta_keywords'),
  metaDescription: text('meta_description'),
  productUrl: text('product_url'),
  slug: text('slug').unique().notNull(),
  thumbnail: text('thumbnail').unique().notNull(),
  status: text('status', {
    enum: ['published', 'pending', 'draft'],
  }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  product_id: uuid('product_id').notNull().references(() => products.id),
  comment: text('content'),
  rating: integer('rating').default(0).notNull(),
  images: jsonb('images'),
  transactionId: text('transaction_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const usersRelations = relations(users, ({ one }) => ({
  emailVerificationByEmail: one(emailVerifications, {
    fields: [users.email],
    references: [emailVerifications.emailOrPhone],
  }),
  emailVerificationByPhone: one(emailVerifications, {
    fields: [users.phone],
    references: [emailVerifications.emailOrPhone],
  }),
  merchant: one(merchants, {
    fields: [users.id],
    references: [merchants.user_id],
  }),
}))

export const merchantsRelations = relations(merchants, ({ many }) => ({
  products: many(products), // ✅ Remove `fields` and `references`
}))

export const productRelations = relations(products, ({ many }) => ({
  reviews: many(reviews),
}))

export const reviewRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.product_id],
    references: [products.id],
  }),
}))
