import type { z } from 'zod'
import { categorySchema, orderStatusSchema, productSchema, userSchema } from '~~/server/database/schema-validator'

export type OpenApiRegistryEntry = {
  summary?: string
  description?: string
  tags?: string[]
  requiresAuth?: boolean
  requestBodyZod?: z.ZodTypeAny
  requestBodySchema?: any
  requestBodyContentType?: string
  requestBodyRequired?: boolean
  queryParams?: Record<string, { required?: boolean, schema: any }>
  responseDataJsonSchema?: any
  rawResponseJsonSchema?: any
}

const pagination = {
  page: { schema: { type: 'integer', minimum: 1, default: 1 } },
  perPage: { schema: { type: 'integer', minimum: 1, default: 10 } },
}

const filterSortCommon = {
  q: { schema: { type: 'string' } },
  filterBy: { schema: { type: 'string', description: 'JSON string of filters' } },
  sort: { schema: { type: 'string' } },
  order: { schema: { type: 'string', enum: ['asc', 'desc'] } },
}

const multipartCategorySchema = {
  type: 'object',
  properties: {
    image: { type: 'string', description: 'Base64-encoded image string' },
    name: { type: 'string' },
    description: { type: 'string' },
    parent_id: { type: 'string' },
    slug: { type: 'string' },
    pathname: { type: 'string' },
  },
}

const multipartMerchantSchema = {
  type: 'object',
  properties: {
    image: { type: 'string', description: 'Base64-encoded logo string' },
    user_id: { type: 'string' },
    name: { type: 'string' },
    description: { type: ['string', 'null'] },
    address: { type: ['string', 'null'] },
    website: { type: ['string', 'null'] },
    status: { type: ['string', 'null'] },
    pathname: { type: 'string' },
  },
}

const multipartProductSchema = {
  type: 'object',
  properties: {
    thumbnail: { type: 'string', description: 'Base64 thumbnail string or URL' },
    // file-* entries are used for additional images; represented as array
    files: { type: 'array', items: { type: 'string' }, description: 'Additional base64 file strings' },
    // remaining fields align with productSchema (sent as strings in FormData)
    title: { type: 'string' },
    slug: { type: 'string' },
    price: { type: 'number' },
    offer_price: { type: 'number' },
    status: { type: 'string' },
    category_id: { type: 'number' },
    variants: {},
    product_visibility: {},
    tags: { type: 'array', items: { type: 'string' } },
  },
}

export const chapter4Registry: Record<string, OpenApiRegistryEntry> = {
  // dashboard/categories
  'GET /api/dashboard/categories': {
    summary: 'List categories (dashboard)',
    requiresAuth: true,
    queryParams: { ...pagination },
    responseDataJsonSchema: { type: 'object' },
  },
  'POST /api/dashboard/categories': {
    summary: 'Create category (multipart form)',
    requiresAuth: true,
    requestBodyContentType: 'multipart/form-data',
    requestBodySchema: multipartCategorySchema,
    responseDataJsonSchema: { type: 'string' },
  },
  'PATCH /api/dashboard/categories/{id}': {
    summary: 'Update category (multipart form)',
    requiresAuth: true,
    requestBodyContentType: 'multipart/form-data',
    requestBodySchema: multipartCategorySchema,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'DELETE /api/dashboard/categories/{id}': {
    summary: 'Soft delete category',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'string' },
  },
  'GET /api/dashboard/categories/{id}': {
    summary: 'Get category by id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'PATCH /api/dashboard/categories/{id}/undo-delete': {
    summary: 'Undo category delete',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'string' },
  },
  'DELETE /api/dashboard/categories/bulk': {
    summary: 'Bulk delete categories',
    requiresAuth: true,
    queryParams: {
      categories: { required: true, schema: { type: 'string', description: 'Comma-separated category ids' } },
    },
    responseDataJsonSchema: { type: 'string' },
  },

  // dashboard/products
  'GET /api/dashboard/products': {
    summary: 'List products (dashboard)',
    requiresAuth: true,
    queryParams: { ...pagination, ...filterSortCommon },
    responseDataJsonSchema: { type: 'object' },
  },
  'POST /api/dashboard/products': {
    summary: 'Create product (multipart form)',
    requiresAuth: true,
    requestBodyContentType: 'multipart/form-data',
    requestBodySchema: multipartProductSchema,
    responseDataJsonSchema: { type: 'object' },
  },
  'POST /api/dashboard/products/save': {
    summary: 'Save product as draft (JSON)',
    requiresAuth: true,
    requestBodyZod: productSchema,
    responseDataJsonSchema: { type: 'string' },
  },
  'GET /api/dashboard/products/has-slug': {
    summary: 'Check if product slug exists',
    requiresAuth: true,
    queryParams: { slug: { required: true, schema: { type: 'string' } } },
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/dashboard/products/{id}': {
    summary: 'Get product by id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'PATCH /api/dashboard/products/{id}': {
    summary: 'Update product (multipart form)',
    requiresAuth: true,
    requestBodyContentType: 'multipart/form-data',
    requestBodySchema: multipartProductSchema,
    responseDataJsonSchema: { type: 'object' },
  },
  'PATCH /api/dashboard/products/{id}/save': {
    summary: 'Save product updates as draft (JSON)',
    requiresAuth: true,
    requestBodyZod: productSchema,
    responseDataJsonSchema: { type: 'object' },
  },
  'DELETE /api/dashboard/products/{id}': {
    summary: 'Delete product by id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },

  // dashboard/orders
  'GET /api/dashboard/orders': {
    summary: 'List merchant orders (dashboard)',
    requiresAuth: true,
    queryParams: {
      page: { schema: { type: 'integer', minimum: 1, default: 1 } },
      perPage: { schema: { type: 'integer', minimum: 1, default: 10 } },
      status: { schema: { type: 'string' } },
      fromDate: { schema: { type: 'string' } },
      toDate: { schema: { type: 'string' } },
    },
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/dashboard/orders/{id}': {
    summary: 'Get merchant order details',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'PATCH /api/dashboard/orders/{id}': {
    summary: 'Update order status',
    requiresAuth: true,
    requestBodyZod: orderStatusSchema,
    responseDataJsonSchema: { type: 'object' },
  },

  // dashboard/users
  'GET /api/dashboard/users': {
    summary: 'List users (dashboard)',
    requiresAuth: true,
    queryParams: { ...pagination, ...filterSortCommon, isMerchants: { schema: { type: 'string', enum: ['true', 'false'] } } },
    responseDataJsonSchema: { type: 'object' },
  },
  'POST /api/dashboard/users': {
    summary: 'Create user',
    requiresAuth: true,
    requestBodyZod: userSchema,
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/dashboard/users/{id}': {
    summary: 'Get user by id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'PATCH /api/dashboard/users/{id}': {
    summary: 'Update user by id',
    requiresAuth: true,
    requestBodyZod: userSchema,
    responseDataJsonSchema: { type: 'object' },
  },
  'DELETE /api/dashboard/users/{id}': {
    summary: 'Delete user by id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'string' },
  },

  // dashboard/merchants
  'GET /api/dashboard/merchants': {
    summary: 'List merchants (dashboard)',
    requiresAuth: true,
    queryParams: { ...pagination, ...filterSortCommon },
    responseDataJsonSchema: { type: 'object' },
  },
  'POST /api/dashboard/merchants': {
    summary: 'Create merchant (multipart form)',
    requiresAuth: true,
    requestBodyContentType: 'multipart/form-data',
    requestBodySchema: multipartMerchantSchema,
    responseDataJsonSchema: { type: 'string' },
  },
  'PATCH /api/dashboard/merchants/{id}': {
    summary: 'Update merchant (multipart form)',
    requiresAuth: true,
    requestBodyContentType: 'multipart/form-data',
    requestBodySchema: multipartMerchantSchema,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'DELETE /api/dashboard/merchants/{id}': {
    summary: 'Soft delete merchant',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'string' },
  },
  'PATCH /api/dashboard/merchants/{id}/undo-delete': {
    summary: 'Undo merchant delete',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'string' },
  },
}
