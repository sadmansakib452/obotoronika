import { z } from 'zod'
import { cartSchema, wishlistSchema } from '~~/server/database/schema-validator'

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

export const chapter2Registry: Record<string, OpenApiRegistryEntry> = {
  // catalog
  'GET /api/products': {
    summary: 'List products (published)',
    queryParams: {
      page: { schema: { type: 'integer', minimum: 1, default: 1 } },
      perPage: { schema: { type: 'integer', minimum: 1, default: 10 } },
      q: { schema: { type: 'string' } },
      filterBy: { schema: { type: 'string' } },
      sort: { schema: { type: 'string', default: 'created_at' } },
      order: { schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
    },
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        products: { type: 'array', items: { type: 'object' } },
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
      required: ['products', 'meta'],
    },
  },
  'GET /api/products/featured': {
    summary: 'List featured products',
    queryParams: {
      page: { schema: { type: 'integer', minimum: 1, default: 1 } },
      perPage: { schema: { type: 'integer', minimum: 1, default: 10 } },
      q: { schema: { type: 'string' } },
      filterBy: { schema: { type: 'string' } },
      sort: { schema: { type: 'string', default: 'created_at' } },
      order: { schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
    },
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        products: { type: 'array', items: { type: 'object' } },
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
      required: ['products', 'meta'],
    },
  },
  'GET /api/products/search': {
    summary: 'Search products (typeahead)',
    queryParams: {
      q: { schema: { type: 'string', default: '' } },
      limit: { schema: { type: 'integer', minimum: 1, maximum: 20, default: 8 } },
    },
    responseDataJsonSchema: {
      type: 'object',
      properties: { products: { type: 'array', items: { type: 'object' } } },
      required: ['products'],
    },
  },
  'GET /api/products/{slug}': {
    summary: 'Get product by slug',
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/products/{slug}/recommendations': {
    summary: 'Get product recommendations',
    rawResponseJsonSchema: {
      type: 'object',
      properties: { recommendations: {} },
      required: ['recommendations'],
    },
  },

  // sections / categories
  'GET /api/products/sections': {
    summary: 'Get home sections with products',
    responseDataJsonSchema: {
      type: 'object',
      properties: { sections: { type: 'array', items: { type: 'object' } } },
      required: ['sections'],
    },
  },
  'GET /api/products/sections/{slug}': {
    summary: 'Get section/category by slug with products',
    queryParams: {
      page: { schema: { type: 'integer', minimum: 1, default: 1 } },
      perPage: { schema: { type: 'integer', minimum: 1, default: 10 } },
      q: { schema: { type: 'string' } },
    },
    responseDataJsonSchema: { type: 'object' },
  },

  // cart
  'GET /api/products/cart': {
    summary: 'Get cart items',
    requiresAuth: true,
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        products: { type: 'array', items: { type: 'object' } },
        unavailable: { type: 'array', items: { type: 'object' } },
      },
      required: ['products', 'unavailable'],
    },
  },
  'POST /api/products/cart': {
    summary: 'Add to cart (or increment)',
    requiresAuth: true,
    requestBodyZod: cartSchema,
    responseDataJsonSchema: { type: 'string' },
  },
  'PATCH /api/products/cart/{id}': {
    summary: 'Update cart item quantity by product id',
    requiresAuth: true,
    requestBodyZod: z.object({ quantity: z.number() }),
    responseDataJsonSchema: { type: 'string' },
  },
  'DELETE /api/products/cart/{id}': {
    summary: 'Remove from cart by product id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'string' },
  },
  'GET /api/products/cart/count': {
    summary: 'Count cart items',
    requiresAuth: true,
    responseDataJsonSchema: {
      type: 'object',
      properties: { total: { type: 'number' } },
      required: ['total'],
    },
  },
  'POST /api/products/cart/delete-many': {
    summary: 'Remove many products from cart',
    requiresAuth: true,
    requestBodyZod: z.object({ product_ids: z.array(z.string()).min(1) }),
    responseDataJsonSchema: {
      type: 'object',
      properties: { deleted: { type: 'number' } },
      required: ['deleted'],
    },
  },

  // wishlist
  'GET /api/products/wishlist': {
    summary: 'Get wishlist items (ids)',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'POST /api/products/wishlist': {
    summary: 'Add product to wishlist',
    requiresAuth: true,
    requestBodyZod: wishlistSchema,
    responseDataJsonSchema: { type: 'string' },
  },
  'DELETE /api/products/wishlist': {
    summary: 'Remove product from wishlist (query param)',
    requiresAuth: true,
    queryParams: {
      product_id: { required: true, schema: { type: 'string', format: 'uuid' } },
    },
    responseDataJsonSchema: { type: 'string' },
  },
  'GET /api/products/wishlist/count': {
    summary: 'Count wishlist items',
    requiresAuth: true,
    responseDataJsonSchema: {
      type: 'object',
      properties: { total: { type: ['number', 'null'] } },
      required: ['total'],
    },
  },
  'GET /api/products/wishlist/products': {
    summary: 'Get wishlist products (paginated)',
    requiresAuth: true,
    queryParams: {
      page: { schema: { type: 'integer', minimum: 1, default: 1 } },
      perPage: { schema: { type: 'integer', minimum: 1, default: 10 } },
    },
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        products: { type: 'array', items: { type: 'object' } },
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
      required: ['products', 'meta'],
    },
  },
}
