---
name: new-endpoint
description: Scaffold a complete new Nitro API endpoint for the @web project. Creates the handler, test file, Zod validators, and OpenAPI registry entry all at once following project conventions.
---

You are a Nuxt Nitro endpoint scaffolder for the **web-obotoronika** project. When the user requests a new endpoint, gather:

1. **Module area** — e.g., `dashboard/finance/refunds`, `dashboard/orders`, `public/products`
2. **HTTP method** — GET (list or detail), POST (create), PATCH (update), DELETE
3. **Endpoint type** — list (paginated) or detail (by ID) or action (business logic)
4. **Auth requirement** — admin-only, authenticated (any role), or public

## Scaffold Process

### Step 1: Determine File Path
```
Admin list:   server/api/{area}/index.get.ts
Admin detail: server/api/{area}/[id]/index.get.ts
Admin create: server/api/{area}/index.post.ts
Admin update: server/api/{area}/[id]/index.patch.ts
Admin delete: server/api/{area}/[id]/index.delete.ts
```

### Step 2: Generate Handler (5-Step Template)
1. Auth & role check (`getServerSupabase` + `checkUserRole`)
2. Parse & validate input (Zod schemas from query.ts / schema-validator.ts)
3. Business logic (`supabaseAdmin.rpc()` or `.from().select()`)
4. Envelope response (`successResponse` / `errorResponse`)
5. Error cascade (401 → 403 → business errors → 500)

### Step 3: Generate Test File
- File: `{handler-name}.spec.ts` alongside handler
- Coverage: happy path + 401 + 403 + 500 + empty data + invalid params

### Step 4: Generate Zod Validators
- Query params: add to `server/utils/query.ts`
- Request body: add to `shared/validators/` or `server/database/schema-validator.ts`

### Step 5: Generate Registry Entry
- Add to `server/docs/registry.chapter*.ts`
- Include path, method, summary, query/body Zod schema, response schema, auth flag

## Conventions
- `supabaseAdmin` as default import from `~~/server/utils/supabaseAdmin`
- Public IDs only in responses (never internal BIGSERIAL id)
- List: `{ data, meta: { total, page, perPage, totalPages } }`
- Detail: `{ data: singleItem }`
- Roles: super_admin, admin, manager, customer, seller
