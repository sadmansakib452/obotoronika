# API 09: Other Endpoints (5)

## Ping

| Method | Path | কী করে |
|--------|------|--------|
| GET | `/api/ping` | Returns `'pong'` — health check. No auth. |

## Create Admin (Dev Only)

| Method | Path | কী করে | Guard |
|--------|------|--------|-------|
| GET | `/api/create-admin` | Dev bootstrap — Super Admin user + merchant + category তৈরি | `NODE_ENV === 'production'` → 404 |

## Visitor Log

| Method | Path | কী করে | Auth |
|--------|------|--------|------|
| POST | `/api/visitor-log` | ভিজিটর সেশন লগ (upsert by session_id + ip_address) | **None** |

## OpenAPI Docs

| Method | Path | কী করে | Guard |
|--------|------|--------|-------|
| GET | `/api/docs/openapi` | OpenAPI 3.1 spec JSON | Dev only (`NODE_ENV === 'production'` → 404) |

## Fake Data Generator

| Method | Path | কী করে | Auth |
|--------|------|--------|------|
| GET | `/api/fake/products` | Fake products তৈরি (1-100, faker-js) | super_admin, admin |

## Key Observations

| File | Issue |
|------|-------|
| `ping.ts` | No auth (fine for health check) |
| `create-admin.get.ts` | Inline `createClient()` instead of shared `supabaseAdmin` |
| `visitor-log.post.ts` | Public, no Zod validation |
| `docs/openapi.get.ts` | No user auth, only env-gated |
| `fake/products.get.ts` | Dev tool, proper auth (only one with standard pattern) |
