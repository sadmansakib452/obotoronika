# 02. আর্কিটেকচার — কিভাবে কাজ করে

## ওভারভিউ

পুরো সিস্টেম **Nuxt 3** এর উপরে বানানো। Nuxt 3 একইসাথে ফ্রন্টএন্ড (Vue) এবং ব্যাকএন্ড (Nitro) সরবরাহ করে — আলাদা সার্ভার দরকার নেই। এটাকে বলে **ফুল-স্ট্যাক মনোলিথ** বা **BFF (Backend For Frontend)** প্যাটার্ন।

```
┌─────────────────────────────────────────────┐
│              Client (Browser)                │
│  Nuxt App (SSR/SSG/SPA)                     │
│  Vue 3 Components + Pinia State             │
└──────────┬──────────────────────────────────┘
           │ HTTP (fetch / $fetch)
           ▼
┌─────────────────────────────────────────────┐
│         Nitro Server (Edge Runtime)          │
│                                              │
│  server/api/     → ~140 REST endpoints       │
│  server/utils/   → Auth, Email, Refund       │
│  server/ssl/     → SSLCommerz SDK            │
│  server/middleware/ → Bandwidth Tracker      │
│  server/docs/    → OpenAPI Spec Builder      │
└──────────┬──────────────────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌──────────┐
│Supabase │ │ External  │
│PostgreSQL│ │ Services  │
│53 mig.  │ │- SSLCom  │
│35+ RPCs │ │- Resend  │
│25+ tables│ │- media   │
└─────────┘ │- Cloudfl.│
           └──────────┘
```

## ৫-স্টেপ API হ্যান্ডলার প্যাটার্ন

প্রত্যেক API endpoint একই প্যাটার্ন follow করে:

```typescript
export default defineEventHandler(async (event) => {
  try {
    // STEP 1: Auth & Role Check
    const supabase = getServerSupabase(event)
    const user = await checkUserRole(event, supabase, ['admin', 'super_admin'])

    // STEP 2: Input Validation (Zod)
    const query = await getQuery(event)
    const validated = mySchema.parse(query)

    // STEP 3: Business Logic
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, title, price')
      .eq('status', 'published')
      .range(0, 9)

    // STEP 4: Envelope Response
    return successResponse(event, 200, data)

  } catch (error) {
    // STEP 5: Error Cascade
    if (error.statusCode === 400) return errorResponse(event, 400, error.message)
    if (error.statusCode === 401) return errorResponse(event, 401)
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
```

## Auth ফ্লো

```
User → Login (email/password or OAuth)
  → Supabase Auth issues JWT
  → post-login handler creates user_sessions record
  → Set-Cookie: sb-*-auth-token (chunked) + session_token
  → Subsequent requests: cookie-based auth
  → checkUserRole() verifies:
      a) JWT valid? → 401 if not
      b) Role in allowed list? → 403 if not
      c) Status == 'active'? → 403 if not
```

দুই ধরণের Supabase client:
- **`getServerSupabase(event)`** — ইউজার-লেভেল (JWT সেশন), auth অপারেশনের জন্য
- **`supabaseAdmin`** — সার্ভিস_রোল (RLS বাইপাস), সব DB অপারেশনের জন্য

## Data ফ্লো

```
Admin Create Product:
  Client → POST /api/dashboard/products (FormData)
    → checkUserRole(['super_admin', 'admin', 'manager', 'seller'])
    → productSchema.parse(transformedData)
    → fileUploader(thumbnail) → media.obotoronika.com
    → supabaseAdmin.from('products').insert(data)
    → successResponse(event, 201, newProduct)

Customer Place Order:
  Client → POST /api/orders
    → checkUserRole(['customer', 'super_admin', 'admin', 'manager'])
    → Manual validation (no Zod body schema)
    → generateOrderId()
    → decreaseProductStock() (with rollback array)
    → Insert orders + merchant_orders + order_items
    → RPC: create_transaction_and_invoices()
    → Clear cart_items
    → successResponse(event, 201, orderData)

Payment Flow:
  Client → GET /api/payment?order_id=xxx
    → Init SSLCommerz session → return mobile banking options
    → User pays on SSLCommerz page
    → SSLCommerz → POST /api/payment/ipn (webhook)
    → validate with SSLCommerz validation API
    → Update transactions, orders, merchant_orders
    → Clear purchased cart items
```

## Response Envelope

```typescript
// Success
{ success: true, status: 200, message: 'Success', data: { ... } }

// Error
{ success: false, status: 400, error: 'Bad Request', message: '...' }

// Paginated List
{ success: true, status: 200, message: 'Success',
  data: { data: [...], meta: { total, page, perPage, totalPages } } }
```

## Database প্যাটার্ন

- **RLS বাইপাস:** সব handler `supabaseAdmin` (service_role) ইউজ করে
- **RLS নেই:** ডাটাবেজে RLS policy নেই — সব অথরাইজেশন অ্যাপ লেয়ারে হয়
- **Business Logic:** জটিল অপারেশন RPC ফাংশনে (যেমন `create_transaction_and_invoices`)
- **Soft Delete:** যেখানে দরকার (categories, merchants) — `deleted_at` কলাম
- **Pagination:** সব list endpoint-এ limit/offset প্যাটার্ন

## Frontend আর্কিটেকচার

```
Pages (~53 routes)
  └── Components (~95)
       ├── atoms/           → Small reusable (Button, Icon, Logo)
       ├── ui/              → shadcn-vue primitives (Dialog, Drawer, etc.)
       ├── layouts/         → default, customer, dashboard
       ├── dashboard/       → Admin feature components
       ├── customer/        → Customer feature components
       ├── product-details/ → Product page components
       └── ...
  └── Stores (12)
       ├── auth, products, cart, orders
       ├── dashboard, finance, returns
       └── analytics, settings, ui, user, variants
  └── Composables (8)
       ├── useAuth, useCart, useLoginModal
       ├── useReturns, useOrderStatusStyles
       └── usePendingActionAfterLogin (session-storage bridge)
```
