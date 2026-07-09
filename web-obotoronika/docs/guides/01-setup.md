# Guide 01: Local Setup

## Prerequisites

- Node.js 18+
- VS Code
- Supabase CLI (optional, for migrations)
- A Supabase project (free tier)

## Steps

### 1. Environment Variables

`.env.example` থেকে কপি করে `.env` তৈরি করুন:

```bash
cp .env.example .env
```

প্রয়োজনীয় ভেরিয়েবল:

```bash
NUXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=anon_key
NUXT_SUPABASE_SERVICE_KEY=service_role_key
SUPABASE_AUTH_COOKIE_DOMAIN=localhost

# SSLCommerz (optional for local dev)
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty

# Email (optional)
NUXT_RESEND_API_KEY=
NUXT_SMTP_HOST=
NUXT_SMTP_PORT=587
NUXT_SMTP_USER=
NUXT_SMTP_PASS=

# Cloudflare (optional)
NUXT_CLOUDFLARE_ACCOUNT_ID=
NUXT_CLOUDFLARE_API_TOKEN=

# Media
NUXT_PUBLIC_MEDIA_URL=http://media.obotoronika.com

# Dev only
NUXT_SUPER_ADMIN_EMAIL=admin@obotoronika.com
NUXT_SUPER_ADMIN_PASSWORD=password123
```

### 2. Install Dependencies

```bash
cd web-obotoronika
npm install
```

### 3. Run Database Migrations

```bash
supabase start        # Start local Supabase
supabase db push      # Apply all 53 migrations
```

Or connect to existing Supabase project via `.env`.

### 4. Create Admin User (Dev)

```bash
# Start dev server
npm run dev

# Run bootstrap endpoint
curl http://localhost:3000/api/create-admin
```

This creates: Super Admin user + default merchant + default category.

### 5. Start Developing

```bash
npm run dev   # → http://localhost:3000
```

## VS Code Setup

Recommended extensions:
- Vue Language Features (Volar)
- Tailwind CSS IntelliSense
- ESLint
- Prettier

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build error: customer/orders missing end tag | Fix `app/components/customer/orders/index.vue:35` |
| Supabase connection failed | Check `.env` URLs and keys |
| SSLCommerz not working | Use test credentials (testbox/qwerty) |
| Media uploads fail | Check `NUXT_PUBLIC_MEDIA_URL` |
