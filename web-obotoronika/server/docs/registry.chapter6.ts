import { z } from 'zod'

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

export const chapter6Registry: Record<string, OpenApiRegistryEntry> = {
  // payment
  'GET /api/payment': {
    summary: 'Create payment gateways payload (SSLCommerz init)',
    queryParams: {
      order_id: { required: true, schema: { type: 'string' } },
    },
    responseDataJsonSchema: { type: 'object' },
  },
  'ANY /api/payment/ipn': {
    summary: 'SSLCommerz IPN callback',
    description: 'This endpoint expects POST callbacks from the payment gateway.',
    requestBodyZod: z.object({ tran_id: z.string().optional() }).passthrough(),
    responseDataJsonSchema: { type: 'object' },
  },

  // misc/dev utilities
  'GET /api/create-admin': {
    summary: 'Create initial super admin (dev utility)',
    responseDataJsonSchema: {},
  },
  'GET /api/fake/products': {
    summary: 'Seed fake products (dev utility)',
    rawResponseJsonSchema: {
      type: 'object',
      properties: { data: { type: 'array', items: { type: 'object' } } },
      required: ['data'],
    },
  },
  'GET /api/merchants/{id}': {
    summary: 'Get merchant by id (public)',
    responseDataJsonSchema: { type: 'object' },
  },
}
