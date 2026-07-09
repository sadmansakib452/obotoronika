import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  slug: z.string().min(3).max(255),
})

export const userSchema = z
  .object({
    name: z.string().min(3).max(255),
    email: z
      .string()
      .email({ message: 'Please provide a valid email address.' })
      .optional(),
    phone: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 characters long.' })
      .max(15, {
        message: 'Phone number must be no longer than 15 characters.',
      })
      .optional(),
    role: z
      .enum(['super_admin', 'admin', 'customer', 'seller', 'manager'], {
        message: 'Role must be one of the following: customer, seller.',
      })
      .default('customer'),
    status: z
      .enum(['active', 'inactive', 'suspended', 'banned'], {
        message:
          'Status must be one of the following: active, inactive, suspended, banned.',
      })
      .default('active'),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .max(64, { message: 'Password must be no longer than 64 characters.' }),
  })
  .refine(data => data.email || data.phone, {
    message: 'Either email or phone must be provided',
    path: ['email'],
  })
  .superRefine(({ email, phone }, ctx: any) => {
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      ctx.addIssue({
        path: ['email'],
        message: 'Invalid email',
      })
    }
    if (phone && (phone.length < 10 || phone.length > 15)) {
      ctx.addIssue({
        path: ['phone'],
        message: 'Phone must be between 10 and 15 digits',
      })
    }
  })

export const productSchema = z.object({
  merchant_id: z
    .number({ required_error: 'Merchant ID is required' })
    .int()
    .optional(),
  category_id: z.number().int().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  files: z.array(z.string()).optional(),
  price: z.number().min(0).optional(),
  cost_price: z.number().optional(),
  offer_price: z.number().optional(),
  track_inventory: z.boolean().optional(),
  initial_stock: z.number().optional(),
  current_stock: z.number().optional(),
  low_stock_alert: z.number().optional(),
  availability: z
    .enum([
      'in_stock',
      'out_of_stock',
      'pre_order',
      'back_order',
      'coming_soon',
    ])
    .optional(),
  global_trade_number: z.string().optional(),
  manufacturer_number: z.string().optional(),
  brand: z.string().optional(),
  item_upc: z.string().optional(),
  custom_fields: z.unknown().optional(),
  free_shipping: z.boolean().optional(),
  shipping_price: z.number().optional(),
  location_based_shipping: z.boolean().optional(),
  location_based_shipping_price: z.unknown().optional(),
  available_date: z.string().optional(), // Can be validated as a timestamp if necessary
  end_date: z.string().optional(), // Can be validated as a timestamp if necessary
  variants: z.unknown().optional(),
  tags: z.array(z.string()).optional(),
  page_title: z.string().optional(),
  meta_keywords: z.array(z.string()).optional(),
  meta_description: z.string().optional(),
  product_url: z.string().optional(),
  slug: z.string().min(1).max(255).optional(),
  thumbnail: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived', 'pending']).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  //  product_visibility will be a object type with any key value pair
  product_visibility: z.unknown().optional(),
})

export const sectionsSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  slug: z.string().min(1).max(255),
  status: z.enum(['draft', 'published']).optional(),
  active_position: z.number().optional(),
})

export const bannerSchema = z.object({
  image_url: z.string().optional(), // Optional because it's set after upload
  title: z.string().optional(),
  description: z.string().optional(),
  button_text: z.string().optional(),
  button_link: z.string().optional(),
  section_id: z.number().int().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  display_order: z.number().int().optional().nullable(),
})

export const wishlistSchema = z.object({
  product_id: z.string({ required_error: 'Product ID is required.' }).uuid(),
})

export const cartSchema = z.object({
  product_id: z.string({ required_error: 'Product ID is required.' }).uuid(),
  quantity: z.number().min(1),
  variants: z.any({ required_error: 'Variants is are required' }),
})

export const orderStatusSchema = z.object({
  status: z.enum(
    [
      'pending',
      'awaiting_payment',
      'processing',
      'shipped',
      'delivered',
      'completed',
      'canceled',
      'returned',
      'refunded',
      'failed',
    ],
    {
      required_error: 'Status is required.',
      invalid_type_error:
        'Status must be one of: pending, completed, or cancelled.',
    },
  ),
})

export const addressSchema = z.object({
  fullname: z
    .string({ required_error: 'Name is mandatory.' })
    .nonempty('Name is mandatory.'),
  phone: z
    .string({ required_error: 'Phone is mandatory.' })
    .nonempty('Phone is mandatory.'),
  region: z.string({ required_error: 'Region is mandatory.' }),
  city: z.string({ required_error: 'City is mandatory.' }),
  address: z
    .string({ required_error: 'Address is mandatory.' })
    .nonempty('Address is mandatory.'),
  address_type: z
    .string({ required_error: 'Address type is mandatory.' })
    .nonempty('Address type is mandatory.'),
})

export const verifySchema = z.object({
  code: z
    .string({ required_error: 'Code is mandatory.' })
    .nonempty('Code is mandatory.'),
  emailOrPhone: z
    .string({ required_error: 'Email or Phone is mandatory.' })
    .nonempty('Email or Phone is mandatory.'),
})

export const registrationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  emailOrPhone: z.string(),
  password: z.string(),
})

export const variantSchema = z.object({
  name: z.string({ required_error: 'Name is required.' }),
  key: z.string({ required_error: 'Key is required.' }),
  field_type: z.string({ required_error: 'Field type is required.' }),
  description: z.string().optional(),
})

export const variantOptionSchema = z.object({
  label: z.string().optional(),
  value: z.string({ required_error: 'Value is required.' }),
})

export const ratingSchema = z.object({
  comment: z.string().optional(),
  rating: z.number({ required_error: 'Rating is required.' }),
  order_id: z.number({ required_error: 'Order ID is required.' }),
  order_item_id: z.number({ required_error: 'Order Item ID is required.' }),
  product_id: z.string({ required_error: 'Product ID is required.' }),
})
