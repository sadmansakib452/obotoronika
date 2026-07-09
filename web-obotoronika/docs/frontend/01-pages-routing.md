# Frontend 01: পৃষ্ঠা ও রাউটিং (~53 Routes)

## Nuxt 3 File-based Routing

Nuxt 3 স্বয়ংক্রিয়ভাবে `app/pages/` ডিরেক্টরি থেকে রুট জেনারেট করে।

## Page Structure

```
pages/
├── index.vue                  → / (হোমপেজ)
├── login.vue                  → /login
├── forgot-password.vue        → /forgot-password
├── reset-password.vue         → /reset-password
├── cancel.vue                 → /cancel (পেমেন্ট)
├── fail.vue                   → /fail (পেমেন্ট)
├── order-received.vue         → /order-received
├── contact-us.vue             → /contact-us
├── privacy-policy.vue         → /privacy-policy
├── terms-and-conditions.vue   → /terms-and-conditions
│
├── auth/
│   └── callback.vue           → /auth/callback (OAuth PKCE)
│
├── cart/
│   └── index.vue              → /cart
├── category/
│   └── [slug].vue             → /category/:slug
├── products/
│   └── [slug].vue             → /products/:slug
├── sections/
│   ├── index.vue              → /sections
│   └── [slug]/index.vue       → /sections/:slug
├── shipping/
│   └── index.vue              → /shipping
├── checkout/
│   ├── payment-method.vue     → /checkout/payment-method
│   └── payment-gateway/
│       └── bkash.vue          → /checkout/payment-gateway/bkash
│
├── user/                      → Customer Account (7 pages)
│   ├── profile.vue
│   ├── addresses.vue
│   ├── orders/
│   │   ├── index.vue
│   │   └── [order_id].vue
│   ├── returns.vue
│   ├── reviews.vue
│   ├── settings.vue
│   └── wishlist.vue
│
└── dashboard/                 → Admin Panel (27 pages)
    ├── analytics.vue
    ├── merchants/index.vue
    ├── profile/index.vue
    ├── returns/[id].vue
    ├── users/index.vue
    ├── categories/
    │   ├── index.vue, new.vue, [id]/edit.vue
    ├── orders/
    │   ├── index.vue, new.vue, [id]/index.vue
    ├── products/
    │   ├── index.vue, new.vue, edit/[id].vue
    ├── variants/
    │   ├── index.vue, [id]/options.vue
    ├── settings/
    │   ├── general.vue, security.vue, notifications.vue
    ├── website/
    │   ├── banners.vue, sections/index.vue
    │   └── settings/general.vue, settings/appearance.vue
    └── finance/
        ├── transactions/index.vue
        ├── refunds/index.vue
        ├── cancellations/index.vue
        ├── invoices/index.vue, invoices/[id]/index.vue
        └── payouts/index.vue
```

## Middleware

ডিরেক্টরিতে কোনো custom route middleware নেই (`app/middleware/` empty or absent)। Auth guard সার্ভার সাইডে API handler-এ হয়, ক্লায়েন্ট সাইডে নয়।

## Layouts

তিনটি layout:

| Layout | Path | ব্যবহার |
|--------|------|---------|
| **default** | `layouts/default/` | Public pages (home, products, cart) — header + footer |
| **customer** | `layouts/customer/` | `/user/*` pages — customer sidebar |
| **dashboard** | `layouts/dashboard/` | `/dashboard/*` pages — admin sidebar + header |

## Key Dynamic Routes

| Pattern | Example | File |
|---------|---------|------|
| `/category/:slug` | `/category/electronics` | `category/[slug].vue` |
| `/products/:slug` | `/products/iphone-15` | `products/[slug].vue` |
| `/sections/:slug` | `/sections/new-arrivals` | `sections/[slug]/index.vue` |
| `/user/orders/:id` | `/user/orders/ORD123` | `user/orders/[order_id].vue` |
| `/dashboard/returns/:id` | `/dashboard/returns/5` | `dashboard/returns/[id].vue` |
| `/dashboard/products/edit/:id` | `/dashboard/products/edit/abc-123` | `dashboard/products/edit/[id].vue` |
| `/dashboard/finance/invoices/:id` | `/dashboard/finance/invoices/INV-123` | `dashboard/finance/invoices/[id]/index.vue` |
