# API 01: Authentication (10 Endpoints)

## কিভাবে কাজ করে

Supabase Auth (PKCE) + custom `user_sessions` table. প্রতিটি login-এ একটি UUID session token জেনারেট হয়, SHA-256 hash করে DB-তে সংরক্ষণ হয়, এবং httpOnly cookie-তে পাঠানো হয়।

## Endpoints

### Public — OTP Verification (3)

| Method | Path | Handler | Zod | DB Tables |
|--------|------|---------|-----|-----------|
| POST | `/api/auth/verify-identifier` | OTP পাঠানো (email/SMS pending) | `{ emailOrPhone }` inline | `verifications` |
| POST | `/api/auth/verify` | OTP ভেরিফাই | `verifySchema` | `verifications` |
| POST | `/api/auth/forgot-password` | রিসেট OTP পাঠানো | `{ emailOrPhone }` inline | `verifications` |

### Public — Registration & Reset (3)

| Method | Path | Handler | Zod | DB Tables |
|--------|------|---------|-----|-----------|
| POST | `/api/auth/signup` | নিবন্ধন (Supabase Auth createUser) | `registrationSchema` | `verifications`, Auth users |
| POST | `/api/auth/signin` | লগইন (password-based) | ❌ **NO Zod** | Auth, `user_sessions` |
| POST | `/api/auth/reset-password` | পাসওয়ার্ড রিসেট (OTP + new password) | inline Zod | `verifications`, Auth |

### Authenticated (4)

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| POST | `/api/auth/post-login` | Post-login callback (JWT → session) | Token/Body/Cookie |
| DELETE | `/api/auth/logout` | Sign out (Supabase, not DB) | Cookie session |
| GET | `/api/auth/sessions` | লিস্ট সেশন | সব roles |
| DELETE | `/api/auth/sessions/[id]` | ডিলিট সেশন | সব roles |

## গুরুত্বপূর্ণ ফাইল

| File | কী করে |
|------|--------|
| `server/utils/checkUserRole.ts` | Auth guard — all handlers ইউজ করে (but inconsistent signature!) |
| `server/utils/session.ts` | `generateSessionToken()` + `hashSessionToken()` |
| `server/utils/supabaseAuthCookies.ts` | OAuth bridge → cookie chunking |
| `server/utils/supabaseAdmin.ts` | Service_role client (Auth Admin API) |
| `server/database/schema-validator.ts` | `verifySchema`, `registrationSchema` |

## Issues

- **signin.post.ts** — কোনো Zod validation নেই, raw body Supabase-এ পাঠায়
- **sessions/index.get.ts** — `user_id` filter নেই (RLS-এর উপর নির্ভরশীল নাকি bug?)
- **sessions/[id]/index.delete.ts** — ownership check নেই
- **logout.delete.ts** — `user_sessions` থেকে session ডিলিট করে না
- **post-login.post.ts** — জটিল (161 lines): NuxtHub edge case handle করে
