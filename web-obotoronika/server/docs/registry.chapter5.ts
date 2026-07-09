import { z } from 'zod'
import {
  bannerSchema,
  sectionsSchema,
  variantOptionSchema,
  variantSchema,
} from '~~/server/database/schema-validator'
import { siteSettingsGeneraleSchema } from '~~/shared/validators/req-validators'

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

const multipartBannerSchema = {
  type: 'object',
  properties: {
    image: { type: 'string', description: 'Base64-encoded image string' },
    pathname: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    button_text: { type: 'string' },
    button_link: { type: 'string' },
    section_id: { type: 'string' },
    status: { type: 'string' },
    display_order: { type: 'string' },
  },
}

export const chapter5Registry: Record<string, OpenApiRegistryEntry> = {
  // dashboard/variants
  'GET /api/dashboard/variants': {
    summary: 'List variants/options with value counts',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'POST /api/dashboard/variants': {
    summary: 'Create variant/option',
    requiresAuth: true,
    requestBodyZod: variantSchema,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'GET /api/dashboard/variants/{id}': {
    summary: 'Get variant/option by id (with values)',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'POST /api/dashboard/variants/{id}': {
    summary: 'Create option value for variant',
    requiresAuth: true,
    requestBodyZod: variantOptionSchema,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'DELETE /api/dashboard/variants/{id}': {
    summary: 'Delete variant/option',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/dashboard/variants/options/{id}': {
    summary: 'Get option value by id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'PUT /api/dashboard/variants/options/{id}': {
    summary: 'Update option value by id',
    requiresAuth: true,
    requestBodyZod: variantOptionSchema,
    responseDataJsonSchema: {}, // handler returns successResponse(event,200) without explicit data
  },
  'DELETE /api/dashboard/variants/options/{id}': {
    summary: 'Delete option value by id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/dashboard/variants/product-variants': {
    summary: 'Get variants with values (for product form)',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },

  // dashboard/sections
  'GET /api/dashboard/sections': {
    summary: 'List sections (dashboard)',
    requiresAuth: true,
    queryParams: { status: { schema: { type: 'string' } } },
    responseDataJsonSchema: { type: 'object' },
  },
  'POST /api/dashboard/sections': {
    summary: 'Create section',
    requiresAuth: true,
    requestBodyZod: sectionsSchema,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'PATCH /api/dashboard/sections/manage': {
    summary: 'Set active sections ordering',
    requiresAuth: true,
    requestBodyZod: z.object({
      sections: z.array(z.object({ id: z.any(), index: z.number() })),
    }),
    responseDataJsonSchema: { type: 'string' },
  },
  'DELETE /api/dashboard/sections/{id}': {
    summary: 'Delete section',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'string' },
  },

  // dashboard/banners
  'GET /api/dashboard/banners': {
    summary: 'List banners (dashboard)',
    requiresAuth: true,
    queryParams: { status: { schema: { type: 'string' } } },
    responseDataJsonSchema: { type: 'object' },
  },
  'POST /api/dashboard/banners': {
    summary: 'Create banner (multipart form)',
    requiresAuth: true,
    requestBodyContentType: 'multipart/form-data',
    requestBodySchema: multipartBannerSchema,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'PATCH /api/dashboard/banners/{id}': {
    summary: 'Update banner (multipart form)',
    requiresAuth: true,
    requestBodyContentType: 'multipart/form-data',
    requestBodySchema: multipartBannerSchema,
    responseDataJsonSchema: { type: 'object' },
  },
  'DELETE /api/dashboard/banners/{id}': {
    summary: 'Delete banner',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'string' },
  },

  // dashboard/analytics
  'GET /api/dashboard/analytics/admin': {
    summary: 'Admin analytics summary (role counts)',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/dashboard/analytics/bandwidth-usage': {
    summary: 'Bandwidth usage (last N days)',
    requiresAuth: true,
    queryParams: { days: { schema: { type: 'integer', minimum: 1, default: 30 } } },
    rawResponseJsonSchema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        totalGB: { type: 'number' },
        alert: { type: 'boolean' },
      },
    },
  },
  'GET /api/dashboard/analytics/user-location-summary': {
    summary: 'User location summary (city counts)',
    requiresAuth: true,
    queryParams: { last: { schema: { type: 'integer', minimum: 1, default: 7 } } },
    rawResponseJsonSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {},
        error: { type: 'string' },
      },
    },
  },
  'GET /api/dashboard/analytics/cloudflare': {
    summary: 'Cloudflare analytics (GraphQL)',
    requiresAuth: true,
    queryParams: { last: { schema: { type: 'integer', minimum: 1, default: 10 } } },
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },

  // dashboard/finance
  'GET /api/dashboard/finance/invoices': {
    summary: 'List invoices (merchant)',
    requiresAuth: true,
    queryParams: {
      page: { schema: { type: 'integer', minimum: 1, default: 1 } },
      per_page: { schema: { type: 'integer', minimum: 1, default: 10 } },
      search: { schema: { type: 'string' } },
      min_subtotal: { schema: { type: 'number' } },
      max_subtotal: { schema: { type: 'number' } },
    },
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/dashboard/finance/invoices/{id}': {
    summary: 'Get invoice details by id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/dashboard/finance/transactions': {
    summary: 'List transactions (merchant)',
    requiresAuth: true,
    queryParams: { ...pagination, q: { schema: { type: 'string' } } },
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/dashboard/finance/transactions/{id}': {
    summary: 'Get transaction details by id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },

  // dashboard/settings
  'GET /api/dashboard/settings/website/general': {
    summary: 'Get site settings (general)',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'POST /api/dashboard/settings/website/general': {
    summary: 'Update site settings (general)',
    requiresAuth: true,
    requestBodyZod: siteSettingsGeneraleSchema,
    responseDataJsonSchema: { type: 'string' },
  },

  // menus + public banners
  'GET /api/menus': {
    summary: 'Get navigation menu',
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'GET /api/banners': {
    summary: 'Get active banners',
    responseDataJsonSchema: { type: 'object' },
  },
}
