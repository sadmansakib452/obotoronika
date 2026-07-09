# obotoronika

**ওবোটোরোনিকা** — একটি মাল্টি-ভেন্ডর ই-কমার্স প্ল্যাটফর্ম। এই ওয়ার্কস্পেসে একাধিক প্রজেক্ট রয়েছে যা একসাথে পুরো সিস্টেম তৈরি করে।

---

## Projects

| Project | Path | Description |
|---------|------|-------------|
| **web-obotoronika** | [`web-obotoronika/`](./web-obotoronika/) | মূল ই-কমার্স অ্যাপ (Nuxt 3 + Supabase + SSLCommerz) |
| pos (future) | — | পয়েন্ট-অফ-সেল সিস্টেম |
| inventory (future) | — | ইনভেন্টরি ম্যানেজমেন্ট |

---

## web-obotoronika — Quick Links

| Section | Link |
|---------|------|
| 📚 **সম্পূর্ণ ডকুমেন্টেশন (বাংলা)** | [`web-obotoronika/docs/README.md`](./web-obotoronika/docs/README.md) |
| ⚡ **Dev Server** | `npm run dev` (in `web-obotoronika/`) |
| 🏗️ **Build** | `npm run build` |
| 🔍 **Lint** | `npm run lint` |
| 🗄️ **API Docs** | `/docs` (dev only) |
| 🩺 **Health** | `/api/ping` |

---

## AI Assistant (opencode)

| Resource | Path |
|----------|------|
| Workflow Rules | [`AGENTS.md`](./AGENTS.md) |
| Config | [`opencode.json`](./opencode.json) |
| Agents | [`.opencode/agents/`](./.opencode/agents/) |
| Skills | [`.opencode/skills/`](./.opencode/skills/) |
| Commands | [`.opencode/commands/`](./.opencode/commands/) |
| Memory | [`.opencode/memory/`](./.opencode/memory/) |
| Temp Work | [`.opencode/temp/`](./.opencode/temp/) |

---

## Tech Stack Overview

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 3, Vue 3, Tailwind CSS, @nuxt/ui |
| Backend | Nitro (file-based server engine) |
| Auth | @nuxtjs/supabase (PKCE flow) |
| Database | Supabase PostgreSQL (53 migrations, 35+ RPCs) |
| Payment | SSLCommerz (Bangladeshi gateway) |
| Hosting | NuxtHub / Cloudflare Pages (edge-ready) |
| State | Pinia (12 stores) |
| Validation | Zod (14 server schemas + query schemas) |
| Email | Resend (primary) / SMTP (fallback) |

---

## ~140 API Endpoints by Module

| Module | Count | Description |
|--------|-------|-------------|
| auth | 10 | Registration, login, sessions, password reset |
| products | 18 | Catalog, cart, wishlist, sections, search |
| orders | 16 | CRUD, status filters, cancel/refund requests |
| payment | 2 | SSLCommerz init + IPN webhook |
| refunds | 3 | Refund status, details, processing |
| returns | 4 | Create, list, details, withdraw |
| dashboard | ~62 | Full admin panel (CRUD + analytics + finance) |
| profiles | 11 | User profiles, addresses, shipping calc |
| reviews | 4 | Submit, list, reviewable products |
| geo | 2 | IP geolocation, Bangladesh GeoJSON |
| merchants | 1 | Public merchant detail |
| banners | 1 | Active banners (public) |
| menus | 1 | Hierarchical menu (public) |
| misc | 5 | Ping, create-admin, visitor-log, docs, fake |

---

## Project Status

🚧 **Active Development** — Full details in [progress.md](./.opencode/memory/progress.md)
