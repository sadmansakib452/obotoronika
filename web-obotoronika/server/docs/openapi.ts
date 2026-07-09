import fs from 'node:fs'
import path from 'node:path'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { chapter1Registry } from './registry.chapter1'
import { chapter2Registry } from './registry.chapter2'
import { chapter3Registry } from './registry.chapter3'
import { chapter4Registry } from './registry.chapter4'
import { chapter5Registry } from './registry.chapter5'
import { chapter6Registry } from './registry.chapter6'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'ANY'

type RouteMeta = {
  file: string
  method: HttpMethod
  path: string
  tag: string
  operationId: string
}

function methodFromFile(fileNoExt: string): { method: HttpMethod, base: string } {
  const suffixes: Array<{ suf: string, method: HttpMethod }> = [
    { suf: '.get', method: 'GET' },
    { suf: '.post', method: 'POST' },
    { suf: '.put', method: 'PUT' },
    { suf: '.patch', method: 'PATCH' },
    { suf: '.delete', method: 'DELETE' },
  ]

  for (const { suf, method } of suffixes) {
    if (fileNoExt.endsWith(suf)) return { method, base: fileNoExt.slice(0, -suf.length) }
  }
  return { method: 'ANY', base: fileNoExt }
}

function toOperationId(method: HttpMethod, path: string) {
  const cleaned = path
    .replace(/^\/api\/?/, '')
    .replace(/[{}]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return `${method.toLowerCase()}_${cleaned || 'root'}`
}

function toOpenApiPath(nitroPath: string) {
  // Nitro uses [id] for params; OpenAPI uses {id}
  return nitroPath.replace(/\[([^\]]+)\]/g, '{$1}')
}

function unwrapZodToJsonSchemaResult(res: any): any {
  // zod-to-json-schema may return `$ref` + `definitions`.
  const schema = res?.schema
  if (!schema) return null
  if (schema.$ref && res?.definitions) {
    const key = String(schema.$ref).replace(/^#\/definitions\//, '')
    return res.definitions?.[key] ?? schema
  }
  return schema
}

export function buildRouteInventory(): RouteMeta[] {
  // Dev-only route discovery.
  // Nitro runtime does not support `import.meta.glob`, so we walk `server/api/**` on disk.
  const apiRoot = path.join(process.cwd(), 'server', 'api')

  const routeFiles: string[] = []
  const walk = (dir: string) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) walk(full)
      else if (ent.isFile() && ent.name.endsWith('.ts')) routeFiles.push(full)
    }
  }
  walk(apiRoot)

  const rows: RouteMeta[] = []
  for (const full of routeFiles) {
    // file looks like '.../server/api/products/cart/index.get.ts'
    let rel = path.relative(apiRoot, full).split(path.sep).join('/')
    if (!rel.endsWith('.ts')) continue
    rel = rel.slice(0, -3) // remove .ts

    const { method, base } = methodFromFile(rel)

    // Remove trailing /index to represent folder root route
    const withoutIndex = base.endsWith('/index') ? base.slice(0, -'/index'.length) : base

    const nitroPath = `/api/${withoutIndex}`.replace(/\/+$/, '').replace(/\/{2,}/g, '/')
    const tag = withoutIndex.split('/')[0] || 'root'
    const operationId = toOperationId(method, toOpenApiPath(nitroPath))

    rows.push({
      file: `server/api/${rel}.ts`,
      method,
      path: toOpenApiPath(nitroPath),
      tag,
      operationId,
    })
  }

  rows.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method))
  return rows
}

export function buildOpenApiSpec() {
  const routes = buildRouteInventory()

  const tags = Array.from(new Set(routes.map(r => r.tag))).sort().map(name => ({ name }))

  const successEnvelopeSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      status: { type: 'number' },
      message: { type: 'string' },
      data: {},
      success: { type: 'boolean', const: true },
    },
    required: ['status', 'message', 'data', 'success'],
  }

  const errorEnvelopeSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      status: { type: 'number' },
      error: { type: 'string' },
      message: { type: 'string' },
    },
    required: ['status', 'error', 'message'],
  }

  const paths: Record<string, any> = {}
  const registry = { ...chapter1Registry, ...chapter2Registry, ...chapter3Registry, ...chapter4Registry, ...chapter5Registry, ...chapter6Registry } as Record<string, any>
  for (const r of routes) {
    const methodKey = r.method === 'ANY' ? 'get' : r.method.toLowerCase()
    paths[r.path] ||= {}
    const registryKey = `${r.method} ${r.path}`
    const reg = registry[registryKey]

    const usesEnvelope = !reg?.rawResponseJsonSchema
    const op: any = {
      tags: [r.tag],
      operationId: r.operationId,
      summary: reg?.summary ?? r.path,
    }

    if (reg?.tags?.length) op.tags = reg.tags
    if (reg?.description) op.description = reg.description

    // Security marker (docs only, based on registry)
    if (reg?.requiresAuth) op.security = [{ bearerAuth: [] }]

    // Params (path/query)
    const params: any[] = []
    const paramMatches = [...r.path.matchAll(/\{([^}]+)\}/g)].map(m => m[1])
    for (const name of paramMatches) {
      params.push({
        name,
        in: 'path',
        required: true,
        schema: { type: 'string' },
      })
    }
    if (reg?.queryZod) {
      const qsRaw = zodToJsonSchema(reg.queryZod, { target: 'openApi3' })
      const qs = unwrapZodToJsonSchemaResult(qsRaw) || {}
      const props = qs?.properties || {}
      const required = new Set((qs?.required as string[]) || [])
      for (const [name, schema] of Object.entries(props)) {
        params.push({
          name,
          in: 'query',
          required: required.has(name),
          schema,
        })
      }
    }
    if (reg?.queryParams) {
      for (const [name, meta] of Object.entries(reg.queryParams)) {
        // Don't overwrite if already present from Zod
        if (params.some(p => p.in === 'query' && p.name === name)) continue
        params.push({
          name,
          in: 'query',
          required: Boolean(meta.required),
          schema: meta.schema,
        })
      }
    }
    if (params.length) op.parameters = params

    // Request body
    if (reg?.requestBodyZod) {
      const jsRaw = zodToJsonSchema(reg.requestBodyZod, { target: 'openApi3' })
      const js = unwrapZodToJsonSchemaResult(jsRaw)
      op.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: js ?? {},
          },
        },
      }
    }
    else if (reg?.requestBodySchema) {
      const contentType = reg.requestBodyContentType || 'application/json'
      op.requestBody = {
        required: Boolean(reg.requestBodyRequired ?? true),
        content: {
          [contentType]: {
            schema: reg.requestBodySchema,
          },
        },
      }
    }

    // Responses
    if (usesEnvelope) {
      const successSchema = reg?.responseDataJsonSchema
        ? {
            allOf: [
              { $ref: '#/components/schemas/SuccessEnvelope' },
              { type: 'object', properties: { data: reg.responseDataJsonSchema } },
            ],
          }
        : { $ref: '#/components/schemas/SuccessEnvelope' }

      op.responses = {
        200: {
          description: 'Success',
          content: { 'application/json': { schema: successSchema } },
        },
        400: {
          description: 'Bad Request',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } },
        },
        401: {
          description: 'Unauthorized',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } },
        },
        403: {
          description: 'Forbidden',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } },
        },
        500: {
          description: 'Internal Server Error',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } },
        },
      }
    }
    else {
      op.responses = {
        200: {
          description: 'Success',
          content: { 'application/json': { schema: reg.rawResponseJsonSchema } },
        },
      }
    }

    paths[r.path][methodKey] = op
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'Obotoronika API',
      version: '0.1.0',
      description: 'Dev-only OpenAPI spec generated from Nitro server routes.',
    },
    tags,
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessEnvelope: successEnvelopeSchema,
        ErrorEnvelope: errorEnvelopeSchema,
      },
    },
  }
}
