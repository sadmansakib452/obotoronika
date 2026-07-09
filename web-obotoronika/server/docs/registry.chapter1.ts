import { z } from 'zod'
import {
  addressSchema,
  registrationSchema,
  verifySchema,
} from '~~/server/database/schema-validator'

// Local schemas (kept close to existing handler behavior)
export const signinBodySchema = z.object({
  emailOrPhone: z.string(),
  password: z.string(),
})

export const postLoginBodySchema = z.object({
  session: z
    .object({
      access_token: z.string(),
      refresh_token: z.string().optional(),
      expires_at: z.number().optional(),
      expires_in: z.number().optional(),
      token_type: z.string().optional(),
      user: z.object({ id: z.string() }).optional(),
    })
    .optional(),
})

export const profileUpdateBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please provide a valid email address').optional(),
  phone: z
    .string()
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Please provide a valid phone number')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other']).optional().nullable(),
  dob: z.string().optional().nullable(),
})

export const visitorLogBodySchema = z.object({
  ip: z.string(),
  country: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  pageVisited: z.string(),
  deviceType: z.string().nullable().optional(),
  sessionId: z.string(),
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

export const defaultAddressQuerySchema = z.object({
  is_default: z.string().optional(),
  is_billing: z.string().optional(),
})

export type OpenApiRegistryEntry = {
  // Human-friendly metadata
  summary?: string
  description?: string
  tags?: string[]

  // Auth marker (docs only)
  requiresAuth?: boolean

  // Request
  requestBodyZod?: z.ZodTypeAny
  queryZod?: z.ZodTypeAny
  queryParams?: Record<string, { required?: boolean, schema: any }>

  // Response "data" schema override (envelope is handled by openapi builder)
  // If set to `null`, it means the handler returns `null` data.
  responseDataJsonSchema?: any

  // If handler does NOT use response envelope, set this and provide full schema
  // (Used for ping, visitor-log, sessions delete, etc.)
  rawResponseJsonSchema?: any
}

/**
 * Chapter 1 registry: auth + profile + profiles + shipping + visitor-log + ping
 * Keys are `${METHOD} ${PATH}` where PATH uses OpenAPI form (`/api/x/{id}`).
 */
export const chapter1Registry: Record<string, OpenApiRegistryEntry> = {
  // auth
  'POST /api/auth/signin': {
    summary: 'Sign in (password)',
    requestBodyZod: signinBodySchema,
    responseDataJsonSchema: {}, // returns user or error (dynamic)
  },
  'POST /api/auth/signup': {
    summary: 'Sign up (after OTP verification)',
    requestBodyZod: registrationSchema,
    responseDataJsonSchema: {}, // Supabase createUser response
  },
  'POST /api/auth/verify-identifier': {
    summary: 'Request verification code (OTP)',
    requestBodyZod: z.object({ emailOrPhone: z.string() }),
    responseDataJsonSchema: { type: 'string' },
  },
  'POST /api/auth/verify': {
    summary: 'Verify OTP code',
    requestBodyZod: verifySchema,
    responseDataJsonSchema: { type: 'string' },
  },
  'DELETE /api/auth/logout': {
    summary: 'Logout',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'string' },
  },
  'POST /api/auth/post-login': {
    summary: 'Post-login session bootstrap',
    description: 'Sets session cookies and creates a user_sessions row.',
    requestBodyZod: postLoginBodySchema,
    rawResponseJsonSchema: { type: 'null' }, // handler returns 204 null
  },
  'GET /api/auth/sessions': {
    summary: 'List user sessions',
    requiresAuth: true,
    queryParams: {
      page: { required: false, schema: { type: 'integer', minimum: 1, default: 1 } },
      perPage: { required: false, schema: { type: 'integer', minimum: 1, default: 5 } },
    },
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
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
  'DELETE /api/auth/sessions/{id}': {
    summary: 'Delete a session by id',
    requiresAuth: true,
    rawResponseJsonSchema: {
      type: 'object',
      properties: { currentSession: { type: 'boolean' } },
      required: ['currentSession'],
      additionalProperties: false,
    },
  },
  'ANY /api/auth/template/otp-template': {
    summary: 'OTP HTML template function',
    description: 'Internal helper module, not intended as public HTTP API.',
    rawResponseJsonSchema: {},
  },

  // profile
  'GET /api/profile': {
    summary: 'Get current profile (Supabase user)',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'PATCH /api/profile': {
    summary: 'Update current profile',
    requiresAuth: true,
    requestBodyZod: profileUpdateBodySchema,
    responseDataJsonSchema: { type: 'null' },
  },

  // profiles
  'GET /api/profiles/{id}': {
    summary: 'Get profile by id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'object' },
  },
  'GET /api/profiles/addresses': {
    summary: 'List addresses for current user',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'POST /api/profiles/addresses': {
    summary: 'Create an address for current user',
    requiresAuth: true,
    requestBodyZod: addressSchema,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'GET /api/profiles/addresses/default': {
    summary: 'Get saved/default address',
    requiresAuth: true,
    responseDataJsonSchema: { type: ['object', 'null'] },
  },
  'PATCH /api/profiles/addresses/{id}': {
    summary: 'Update an address by id',
    requiresAuth: true,
    requestBodyZod: addressSchema.partial(),
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'DELETE /api/profiles/addresses/{id}': {
    summary: 'Delete an address by id',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'PATCH /api/profiles/addresses/{id}/default': {
    summary: 'Set default or billing address',
    requiresAuth: true,
    queryParams: {
      is_default: { required: false, schema: { type: 'string' } },
      is_billing: { required: false, schema: { type: 'string' } },
    },
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },
  'PATCH /api/profiles/addresses/{id}/save': {
    summary: 'Mark address as saved (default=true)',
    requiresAuth: true,
    responseDataJsonSchema: { type: 'array', items: { type: 'object' } },
  },

  // shipping
  'GET /api/shipping': {
    summary: 'Checkout shipping details',
    requiresAuth: true,
    queryParams: {
      products: { required: true, schema: { type: 'string', minLength: 1 } },
    },
    responseDataJsonSchema: {
      type: 'object',
      properties: {
        products: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        items: { type: 'array', items: {} },
      },
      required: ['products', 'total', 'items'],
    },
  },

  // visitor-log
  'POST /api/visitor-log': {
    summary: 'Log visitor location and page visits',
    requestBodyZod: visitorLogBodySchema,
    rawResponseJsonSchema: {
      type: 'object',
      properties: { success: { type: 'boolean' } },
      required: ['success'],
      additionalProperties: false,
    },
  },

  // ping
  'ANY /api/ping': {
    summary: 'Ping',
    rawResponseJsonSchema: { type: 'string' },
  },
}
