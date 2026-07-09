# API 07: Profiles & Shipping (11 Endpoints)

## Endpoints

| Method | Path | কী করে | Zod |
|--------|------|--------|-----|
| GET | `/api/profile` | Current user (Auth object) | ❌ None |
| PATCH | `/api/profile` | নাম, ইমেইল, ফোন, জেন্ডার, DOB আপডেট | `profileUpdateSchema` |
| GET | `/api/profiles/[id]` | ইউজার প্রোফাইল by ID | ❌ None |
| GET | `/api/profiles/addresses` | ইউজারের সব অ্যাড্রেস | ❌ None |
| GET | `/api/profiles/addresses/default` | ডিফল্ট অ্যাড্রেস (is_saved → is_default fallback) | ❌ None |
| POST | `/api/profiles/addresses` | নতুন অ্যাড্রেস | `addressSchema` |
| PATCH | `/api/profiles/addresses/[id]/save` | ডিফল্ট অ্যাড্রেস সেট | ❌ Manual |
| PATCH | `/api/profiles/addresses/[id]` | অ্যাড্রেস আপডেট | ⚠️ Imported but unused |
| DELETE | `/api/profiles/addresses/[id]` | অ্যাড্রেস ডিলিট | ❌ None |
| PATCH | `/api/profiles/addresses/[id]/default` | `is_billing` / `is_default` টগল | `defaultAddressQuerySchema` |
| GET | `/api/shipping` | শিপিং চেকআউট প্রিভিউ (product validation + pricing) | ❌ Manual |

## Key Observations

| Issue | File | Details |
|-------|------|---------|
| Unused import | `addresses/[id]/index.patch.ts` | Imports `addressSchema` but never validates body |
| 404 handling bug | `addresses/default.get.ts` | `.single()` throws `PGRST116` → 500 instead of 404 |
| Naming mismatch | `addresses/[id]/save.patch.ts` | Filename says `save`, but updates `is_default` not `is_saved` |
| `select('*')` | `profiles/[id]/index.get.ts` | Returns all columns |
| No pagination | `addresses/index.get.ts` | Fetches all addresses without limit |

## Auth

সব 11 টি endpoint-ই auth-required (all 5 roles allowed)। সবগুলো `supabaseAdmin` (service_role) ইউজ করে DB অপারেশনের জন্য, আর `checkUserRole()` দিয়ে ইউজার ভেরিফাই করে।
