# Guide 03: Deployment

## Hosting Architecture

```
Cloudflare Pages (CDN)
  └── Cloudflare Workers (SSR via NuxtHub)
       └── Supabase (PostgreSQL)
       └── media.obotoronika.com (Image server)
       └── Resend / SMTP (Email)
```

## NuxtHub Deployment

```bash
# Install NuxtHub CLI
npx nuxthub deploy

# Or via GitHub Actions (auto-deploy on push)
```

NuxtHub Cloudflare Workers-এ SSR deploy করে, assets Cloudflare Pages-এ serve করে।

## Environment Variables (Production)

Production-এ সব sensitive variable সেট করতে হবে:

```bash
NUXT_SUPABASE_URL=
NUXT_SUPABASE_SERVICE_KEY=      # service_role key (never exposed to client)

# SSLCommerz (live)
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=

# Email
NUXT_RESEND_API_KEY=

# Cloudflare
NUXT_CLOUDFLARE_ACCOUNT_ID=
NUXT_CLOUDFLARE_API_TOKEN=

# Media
NUXT_PUBLIC_MEDIA_URL=
```

## Database Migrations

```bash
supabase db push    # Apply pending migrations
supabase migration list  # Check status
supabase db pull    # Pull remote schema (if needed)
```

## Pre-build Check

```bash
npm run build        # Production build
npm run lint         # Check for errors
```

**Known build error:** `app/components/customer/orders/index.vue:35:3` — missing end tag. Fix before deployment.

## Performance Notes

- Edge runtime (Cloudflare Workers) → no Node.js APIs
- Static assets → Cloudflare CDN
- Database → Supabase (choose region close to target)
- Media → Separate Express server for flexible image processing
- Bandwidth tracking → Optional middleware, can be disabled
