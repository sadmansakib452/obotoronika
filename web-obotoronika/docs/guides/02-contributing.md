# Guide 02: Contributing Guide

## Code Conventions

### API Handler Template

```typescript
export default defineEventHandler(async (event) => {
  try {
    // 1. Auth
    // 2. Validation (Zod)
    // 3. Business Logic (supabaseAdmin)
    // 4. Envelope Response
  } catch (error) {
    // 5. Error Cascade
  }
})
```

### File Naming

- `handler.method.ts` (GET → `.get.ts`, POST → `.post.ts`, etc.)
- Dynamic params → `[param]` folder
- PascalCase for Vue components
- camelCase for utilities

### Response Envelope

```typescript
// Always use:
successResponse(event, 200, data)
errorResponse(event, 400, 'message')
```

### Validation

```typescript
// Query params from query.ts
import { productsQuerySchema } from '~~/server/utils/query'

// Body from schema-validator.ts
import { productSchema } from '~~/server/database/schema-validator'
```

### Permissions

```typescript
// Use checkUserRole consistently:
const user = await checkUserRole(event, supabase, ['admin', 'super_admin'])
// NOT: checkUserRole(supabase, [...] )
```

### Database

- All admin operations → `supabaseAdmin` (service_role)
- List endpoints → paginated (RPC list + count pattern)
- Use `.select()` with specific columns, not `*`
- Add proper error handling + rollback for complex operations

## PR Guidelines

1. One feature/fix per PR
2. Include tests (Vitest)
3. Run `npm run lint` before commit
4. Update OpenAPI registry if adding endpoints
5. Update docs if changing behavior

## OpenAPI Docs

- Registry: `server/docs/registry.chapter*.ts`
- Add endpoint entry with `requestBodyZod`, `queryZod`, `responseDataJsonSchema`
- Verify at `/docs` (dev only)
