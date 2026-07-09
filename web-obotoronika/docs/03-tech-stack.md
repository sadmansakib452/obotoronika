# 03. টেক স্ট্যাক — কেন এই টুলস?

## Core Framework

| Tool | Version | ব্যবহার | কারণ |
|------|---------|---------|------|
| **Nuxt 3** | 3.15.4 | ফুল-স্ট্যাক ফ্রেমওয়ার্ক | SSR + API routes একসাথে; কম боilerplate; বড় ecosystem |
| **Nitro** | 2.10.4 | সার্ভার ইঞ্জিন | Edge-ready (Cloudflare Workers); auto-imports; file-based routing |
| **Vue 3** | 3.x | UI ফ্রেমওয়ার্ক | Reactive, composable, TypeScript support |

**কেন আলাদা ব্যাকএন্ড না?** — BFF প্যাটার্ন ব্যবহার করে ফ্রন্টএন্ড ও ব্যাকএন্ড একসাথে রাখা হয়েছে। এর ফলে:
- একটি কোডবেস
- টাইপ শেয়ার করা সহজ (shared/types/)
- ডিপ্লয়মেন্ট সহজ
- লেটেন্সি কম (একই সার্ভারে)

## UI & Styling

| Tool | ব্যবহার | কারণ |
|------|---------|------|
| **@nuxt/ui** v2.21.0 | UI কম্পোনেন্ট লাইব্রেরি | Tailwind-based, accessible, Vue 3 native. `ui.global: false` → explicit import |
| **Tailwind CSS** | Utility-first CSS | দ্রুত ডিজাইন, consistent, পারফরম্যান্স |
| **shadcn-vue** (ui/) | Copy-paste UI primitives | Dialog, Drawer, Command, Popover, etc. — fully customizable |
| **Radix Vue** (via shadcn) | Headless UI primitives | Accessibility, keyboard navigation |

**ui.global: false কেন?** — Explicit import করলে bundle size কমে, tree-shaking optimize হয়।

## State Management

| Tool | ব্যবহার |
|------|---------|
| **Pinia** | সব স্টোর ম্যানেজমেন্ট (12 stores) |
| **@pinia/nuxt** | Nuxt integration (auto-import stores) |
| **useState()** | Cross-component global state (login modal, pending actions) |

**স্টোর প্যাটার্ন:** প্রত্যেক স্টোরে `isLoading`, `data: Record<string, any[]>` (cache by page key), `pagination: { page, perPage, total, totalPages }`.

## Validation

| Tool | ব্যবহার |
|------|---------|
| **Zod** | সার্ভার + ক্লায়েন্ট উভয় জায়গায় |
| **14 schemas** | `schema-validator.ts`-এ (product, user, category, cart, address, etc.) |
| **10 query schemas** | `query.ts`-এ (pagination validators) |
| **1 shared schema** | `shared/validators/req-validators.ts` (site settings) |

## Database & Auth

| Tool | ব্যবহার | কারণ |
|------|---------|------|
| **Supabase PostgreSQL** | ডাটাবেজ | Open-source, hosted, Row Level Security (এখানে ব্যবহার করা হয়নি) |
| **@nuxtjs/supabase** | Auth integration | PKCE flow, SSR cookies, auto-refresh |
| **supabaseAdmin (service_role)** | Admin DB operations | RLS বাইপাস করে অ্যাডমিন অপারেশন |

**কেন RLS ব্যবহার করা হয়নি?** — সব অথরাইজেশন অ্যাপ লেয়ারে (checkUserRole) করা হয়েছে। এতে logic centralized থাকে এবং debugging সহজ হয়।

## Payment

| Tool | ব্যবহার |
|------|---------|
| **SSLCommerz** | বাংলাদেশী পেমেন্ট গেটওয়ে |
| **SDK** (server/ssl/) | কাস্টম SDK (init, validate, refund, query) |
| **IPN** | Instant Payment Notification webhook |

**কেন সরাসরি API?** — SSLCommerz-এর নিজস্ব Node.js SDK নেই, তাই কাস্টম SDK বানানো হয়েছে ৬টি API endpoint কভার করে।

## Email

| Tool | ব্যবহার |
|------|---------|
| **Resend** | Primary email provider (ট্রানজেকশনাল ইমেইল) |
| **Nodemailer (SMTP)** | Fallback provider |
| **3 Templates** | OTP, Reset Password, Welcome |

ডুয়াল-প্রোভাইডার প্যাটার্ন: Resend API Key থাকলে Resend ইউজ করবে, না থাকলে SMTP-তে fallback করবে।

## File Storage

| Tool | ব্যবহার |
|------|---------|
| **media.obotoronika.com** | ইমেজ স্টোরেজ (Express API) |
| **fileUploader()** | মাল্টিপার্ট ফাইল আপলোড ইউটিলিটি |

ছবি আলাদা সার্ভারে রাখার কারণ — CDN caching সহজ, Nuxt build size ছোট হয়।

## Geo & Analytics

| Tool | ব্যবহার |
|------|---------|
| **ipwho.is** | Free GeoIP API |
| **Cloudflare GraphQL** | CDN analytics (requests, bandwidth, threats) |
| **MaxMind GeoIP** | User location data |
| **ব্যান্ডউইথ ট্র্যাকার** | Global middleware → bandwidth_logs table |

## Deployment

| Tool | ব্যবহার |
|------|---------|
| **NuxtHub** | Deployment platform |
| **Cloudflare Pages** | Edge runtime |
| **Cloudflare Workers** | SSR execution |

Edge-ready architecture — SSR Cloudflare Workers-এ রান করে, ডাটাবেস Supabase-এ, ফাইল media server-এ।

## Dev Tools

| Tool | ব্যবহার |
|------|---------|
| **faker-js** | Fake data generation (dev only) |
| **zod-to-json-schema** | OpenAPI spec generation |
| **Redocly** | API docs rendering (/docs) |

## ডিপেন্ডেন্সি সংখ্যা (package.json)

| Type | Count |
|------|-------|
| dependencies | ~25 |
| devDependencies | ~15 |

মিনিমাল ডিপেন্ডেন্সি — শুধু দরকারি টুলস রাখা হয়েছে।
