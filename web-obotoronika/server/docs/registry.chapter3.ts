import { z } from 'zod'
import { checkoutQuery, ordersQuerySchema, toReviewsSchema } from '~~/server/utils/query'
import { ratingSchema } from '~~/server/database/schema-validator'

export type OpenApiRegistryEntry = {
  summary?: string
  description?: string
  tags?: string[]
  requiresAuth?: boolean
  requestBodyZod?: z.ZodTypeAny
  queryParams?: Record<string, { required?: boolean, schema: any }>
  responseDataJsonSchema?: any
  rawResponseJsonSchema?: any
}

const paginationQueryParams = {
  page: { schema: { type: 'integer', minimum: 1, default: 1 } },
  perPage: { schema: { type: 'integer', minimum: 1, default: 10 } },
}

export const chapter3Registry: Record<string, OpenApiRegistryEntry> = {
  // orders
  'GET /api/orders': {
    summary: 'List orders for current user',
    requiresAuth: true,
    queryParams: { ...paginationQueryParams },
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        orders: { type: 'array', items: { type: 'object' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            perPage: { type: 'number' },
            totalPages: { type: 'number' },
          },
          required: ['total', 'page', 'perPage', 'totalPages'],
        },
      },
      required: ['orders', 'meta'],
    },
  },
  'POST /api/orders': {
    summary: 'Create order',
    requiresAuth: true,
    requestBodyZod: z.object({
      items: z.array(z.any()).min(1),
      shippingAddress: z.any(),
    }),
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        order: { type: 'object' },
        invoiceData: {},
      },
      required: ['message', 'order', 'invoiceData'],
    },
  },
  'PATCH /api/orders/checkout': {
    summary: 'Checkout order (attach payment info)',
    requiresAuth: true,
    requestBodyZod: checkoutQuery,
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'object' },
      },
      required: ['message', 'data'],
    },
  },
  'GET /api/orders/counts': {
    summary: 'Get order counts (processing/delivered)',
    requiresAuth: true,
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        counts: {
          type: 'object',
          properties: {
            processing: { type: 'number' },
            delivered: { type: 'number' },
          },
          required: ['processing', 'delivered'],
        },
      },
      required: ['counts'],
    },
  },
  'GET /api/orders/{id}': {
    summary: 'Get order details by order_id',
    requiresAuth: true,
    responseDataJsonSchema: {
      type: 'object',
      properties: { order: { type: 'object' } },
      required: ['order'],
    },
  },
  'GET /api/orders/{id}/update-status': {
    summary: 'Update order status to awaiting_payment (admin only)',
    requiresAuth: true,
    responseDataJsonSchema: {
      type: 'object',
      properties: { order: { type: 'object' } },
      required: ['order'],
    },
  },
  'GET /api/orders/auto-cancel': {
    summary: 'Auto-cancel old pending orders',
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        canceled: { type: 'array', items: { type: 'number' } },
        failed: { type: 'array', items: { type: 'number' } },
      },
      required: ['message'],
    },
  },
  'GET /api/orders/processing': {
    summary: 'List processing orders',
    requiresAuth: true,
    queryParams: { ...paginationQueryParams },
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/orders/shipped': {
    summary: 'List shipped orders',
    requiresAuth: true,
    queryParams: { ...paginationQueryParams },
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/orders/delivered': {
    summary: 'List delivered orders',
    requiresAuth: true,
    queryParams: { ...paginationQueryParams },
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/orders/cancelled': {
    summary: 'List cancelled orders',
    requiresAuth: true,
    queryParams: { ...paginationQueryParams },
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/orders/returned': {
    summary: 'List returned orders',
    requiresAuth: true,
    queryParams: { ...paginationQueryParams },
    responseDataJsonSchema: { type: 'object' },
  },

  // reviews
  'GET /api/reviews': {
    summary: 'List current user reviews',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'POST /api/reviews/submit': {
    summary: 'Submit a review',
    requiresAuth: true,
    requestBodyZod: ratingSchema,
    responseDataJsonSchema: { type: 'string' },
  },
  'GET /api/reviews/to-reviews': {
    summary: 'List reviewable products (paginated)',
    requiresAuth: true,
    queryParams: {
      page: { schema: { type: 'integer', minimum: 1, default: 1 } },
      perPage: { schema: { type: 'integer', minimum: 1, default: 10 } },
    },
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        data: {},
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            perPage: { type: 'number' },
            totalPages: { type: 'number' },
          },
          required: ['total', 'page', 'perPage', 'totalPages'],
        },
      },
      required: ['data', 'meta'],
    },
  },
  'GET /api/reviews/{id}/{product_id}': {
    summary: 'Get order item details for review',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
}
