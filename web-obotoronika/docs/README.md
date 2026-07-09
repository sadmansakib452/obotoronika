# 📚 web-obotoronika — সম্পূর্ণ ডকুমেন্টেশন

**ওবোটোরোনিকা** একটি মাল্টি-ভেন্ডর ই-কমার্স প্ল্যাটফর্ম। বাংলাদেশী পেমেন্ট গেটওয়ে (SSLCommerz) সহ ফুল-স্ট্যাক Nuxt 3 অ্যাপ্লিকেশন।

> **ভাষা:** এই ডকুমেন্টেশন বাংলায় লেখা। কোড ও কমেন্ট ইংরেজিতে।

---

## 📖 ডকুমেন্টেশন স্ট্রাকচার

```
web-obotoronika/docs/
├── README.md                         ← তুমি এখানে আছো (Master Index)
│
├── 01-project-overview.md            ← প্রকল্প পরিচিতি
├── 02-architecture.md                ← আর্কিটেকচার (কিভাবে কাজ করে)
├── 03-tech-stack.md                  ← টেক স্ট্যাক (কেন এই টুলস)
│
├── frontend/
│   ├── 01-pages-routing.md           ← পৃষ্ঠা ও রাউটিং
│   ├── 02-components.md             ← কম্পোনেন্ট আর্কিটেকচার
│   ├── 03-state-management.md       ← Pinia স্টোর
│   ├── 04-composables.md            ← কম্পোজেবল
│   └── 05-styling-design.md         ← Tailwind + @nuxt/ui + shadcn
│
├── api/
│   ├── README.md                     ← API সারাংশ + মডিউল টেবিল
│   ├── 01-auth.md                    ← Authentication
│   ├── 02-products.md               ← Products / Catalog
│   ├── 03-orders.md                 ← Orders
│   ├── 04-payment.md                ← SSLCommerz Payment
│   ├── 05-dashboard.md              ← Dashboard (Admin)
│   ├── 06-refunds-returns.md        ← Refunds & Returns
│   ├── 07-profiles-shipping.md      ← Profiles & Shipping
│   ├── 08-reviews-banners-geo.md    ← Reviews, Banners, Geo
│   └── 09-other.md                  ← Miscellaneous Endpoints
│
├── database/
│   ├── 01-schema.md                  ← টেবিল ও রিলেশনশিপ
│   ├── 02-migrations.md             ← মাইগ্রেশন
│   └── 03-rpc-functions.md          ← RPC ফাংশন
│
├── features/
│   ├── 01-auth-flow.md              ← Auth ফ্লো
│   ├── 02-payment-flow.md           ← পেমেন্ট ফ্লো
│   ├── 03-order-flow.md             ← অর্ডার ফ্লো
│   ├── 04-refund-return-flow.md     ← রিফান্ড ও রিটার্ন
│   ├── 05-cart-wishlist-flow.md     ← কার্ট ও উইশলিস্ট
│   └── 06-dashboard-modules.md      ← ড্যাশবোর্ড মডিউল
│
└── guides/
    ├── 01-setup.md                   ← লোকাল সেটআপ
    ├── 02-contributing.md            ← কন্ট্রিবিউশন গাইড
    └── 03-deployment.md             ← ডিপ্লয়মেন্ট
```

---

## 🚀 Quick Stats

| মেট্রিক | সংখ্যা |
|---------|--------|
| API Endpoints | ~140 (21 modules) |
| Pages (Routes) | ~53 |
| Components | ~95 |
| Pinia Stores | 12 |
| Composables | 8 |
| DB Migrations | 53 |
| RPC Functions | ~35 |
| DB Tables | ~25 |

---

## 🏗️ আর্কিটেকচার ওভারভিউ

```
Client (Browser)
    ↕ HTTP/HTTPS
Nuxt 3 (Nitro Server — Edge Runtime)
    ↕
server/api/         → 140 REST endpoints
server/utils/       → Auto-imported utilities
server/ssl/         → SSLCommerz SDK
server/middleware/   → Bandwidth tracker
server/docs/         → OpenAPI 3.1 spec
    ↕
Supabase (PostgreSQL) — 53 migrations, 35+ RPCs
    ↕
External Services:
  SSLCommerz (Payment Gateway)
  Resend / SMTP (Email)
  media.obotoronika.com (Image Storage)
  Cloudflare (CDN, Analytics)
  ipwho.is (GeoIP)
```

---

## 🔐 Auth প্যাটার্ন

```
প্রত্যেক API handler-এ ৫-স্টেপ প্যাটার্ন:

1. Auth & Role Check
   → getServerSupabase(event) + checkUserRole(event, supabase, roles)

2. Input Validation
   → Zod schema (getQuery / readBody / getRouterParam)

3. Business Logic
   → supabaseAdmin.rpc() / supabaseAdmin.from().select()

4. Response Envelope
   → successResponse() / errorResponse()

5. Error Cascade
   → 401 → 403 → Business Errors → 500
```

Admin অপারেশনের জন্য সবসময় `supabaseAdmin` (service_role) ইউজ করা হয়, যা RLS বাইপাস করে।

---

## 📁 ডিরেক্টরি স্ট্রাকচার (সংক্ষিপ্ত)

```
server/
├── api/              ← 21 API modules (~140 endpoints)
├── utils/            ← Shared utilities (auto-imported)
├── ssl/              ← SSLCommerz integration
├── middleware/       ← bandwidthTracker.global.ts
├── database/         ← schema-validator.ts (14 Zod schemas)
├── docs/             ← OpenAPI 3.1 spec + registry (6 chapters)

app/
├── pages/            ← ~53 routes (customer + dashboard)
├── components/       ← ~95 Vue components
├── stores/           ← 12 Pinia stores
└── composables/      ← 8 composables

shared/
├── types/            ← Shared TypeScript types
├── utils/            ← Slugify, form helpers
└── validators/       ← siteSettingsGeneraleSchema
```

---

## 🧭 কোথায় কী পাবেন?

| জানতে চাইলে... | পড়ো |
|----------------|------|
| এই প্রজেক্ট কী, কেন বানানো হয়েছে | [`01-project-overview.md`](./01-project-overview.md) |
| কিভাবে পুরো সিস্টেম কাজ করে | [`02-architecture.md`](./02-architecture.md) |
| কোন টেকনোলজি কেন ইউজ করা হয়েছে | [`03-tech-stack.md`](./03-tech-stack.md) |
| ফ্রন্টএন্ড কিভাবে সংগঠিত | [`frontend/`](./frontend/) |
| কোন API মডিউল কী করে | [`api/README.md`](./api/README.md) |
| ডাটাবেজ টেবিল ও RPC ফাংশন | [`database/`](./database/) |
| সম্পূর্ণ ফিচার ফ্লো (Auth, Payment, Order) | [`features/`](./features/) |
| লোকাল সেটআপ ও ডিপ্লয়মেন্ট | [`guides/`](./guides/) |
