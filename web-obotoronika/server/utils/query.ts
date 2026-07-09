import { z } from 'zod'

export const wishlistQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'Page must be greater than 0' }),
  perPage: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'PerPage must be greater than 0' }),
})

export const ordersQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'Page must be greater than 0' }),
  perPage: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'PerPage must be greater than 0' }),
  q: z.string().optional(),
  filterBy: z.string().optional(),
  sort: z.string().optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const productsQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'Page must be greater than 0' }),
  perPage: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'PerPage must be greater than 0' }),
  q: z.string().optional(),
  filterBy: z.string().optional(),
  sort: z.string().optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const checkoutQuery = z.object({
  order_id: z.string(),
  payment_method: z.string(),
  payment_info: z.string(),
})

export const toReviewsSchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'Page must be greater than 0' }),
  perPage: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'PerPage must be greater than 0' }),
})

export const sessionsQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'Page must be greater than 0' }),
  perPage: z
    .string()
    .default('5')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'PerPage must be greater than 0' }),
})

export const invoicesQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'Page must be greater than 0' }),
  perPage: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'PerPage must be greater than 0' }),
  q: z.string().optional(),
  filterBy: z.string().optional(),
  sort: z.string().optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const usersQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10))
    .nullable(),
  perPage: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10))
    .nullable(),
  q: z.string().optional(),
  filterBy: z.string().optional(),
  sort: z.string().optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  isMerchants: z.string().optional(),
})

export const transactionsQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10)),
  perPage: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10)),
  q: z.string().optional(),
  filterBy: z.string().optional(),
  sort: z.string().optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const defaultAddressQuerySchema = z.object({
  is_default: z
    .string()
    .optional(),
  is_billing: z
    .string()
    .optional(),
})
