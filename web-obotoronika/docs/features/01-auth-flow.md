# Feature 01: Authentication Flow

## Registration

```
User → /signup (page)
  → POST /api/auth/verify-identifier (email/phone → OTP)
  → POST /api/auth/verify (OTP code)
  → POST /api/auth/signup (firstName, lastName, emailOrPhone, password)
    → supabaseAdmin.auth.admin.createUser() ← service_role
    → Welcome email (non-blocking)
```

## Login

```
User → /login (page)
  → POST /api/auth/signin (email, password)
    → supabase.auth.signInWithPassword()
    → checkUserRole() → verify role + status
    → generateSessionToken() → UUID
    → hashSessionToken() → SHA-256
    → INSERT user_sessions (device, OS, browser, IP)
    → Set-Cookie: session_token (httpOnly, 7 days)
    → Set-Cookie: sb-*-auth-token (chunked, for SSR)
```

## Post-Login (NuxtHub Edge Support)

পোস্ট-লগিন endpoint তিনভাবে ইউজার আইডেন্টিফাই করে:
1. `Authorization: Bearer <token>` header
2. Request body → session.access_token
3. SSR cookies → `getServerSupabase(event)`

New user হলে `customer` role assign করে।

## Session Management

```
GET /api/auth/sessions     → List sessions (paginated)
DELETE /api/auth/sessions/[id]  → Delete session

Logout: DELETE /api/auth/logout
  → supabase.auth.signOut({ scope: 'local' })
  → ⚠️ Does NOT delete user_sessions record
```

## Password Reset

```
User → /forgot-password
  → POST /api/auth/forgot-password (email/phone → OTP)
  → Email: 5-digit code (30-min expiry)
  → POST /api/auth/reset-password (emailOrPhone, code, newPassword)
    → Verify OTP → supabaseAdmin.auth.admin.updateUserByEmail()
```

## Key Files

| File | Role |
|------|------|
| `server/api/auth/*.ts` | 10 endpoints |
| `server/utils/checkUserRole.ts` | Auth guard (all handlers) |
| `server/utils/session.ts` | Token + hash |
| `server/utils/supabaseAuthCookies.ts` | Cookie chunking |
| `server/utils/serverSupabase.ts` | getServerSupabase wrapper |
| `app/pages/login.vue` | Login UI |
| `app/components/Auth/*.vue` | Auth components |
| `app/composables/useAuth.ts` | Client auth composable |
| `app/composables/useLoginModal.ts` | Login modal state |
| `app/stores/auth.ts` | Pinia auth store |
