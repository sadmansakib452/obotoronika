# 01. প্রকল্প পরিচিতি — Project Overview

## এই প্রজেক্ট কী?

**ওবোটোরোনিকা (obotoronika)** একটি **মাল্টি-ভেন্ডর ই-কমার্স প্ল্যাটফর্ম** — যেখানে একাধিক seller তাদের প্রোডাক্ট বিক্রি করতে পারে, আর customerরা এক জায়গা থেকে সব কিনতে পারে।

## কেন বানানো হয়েছে?

বাংলাদেশী ই-কমার্স মার্কেটের জন্য একটি সম্পূর্ণ, স্কেলেবল ও কাস্টমাইজেবল সলিউশন তৈরি করা। বড় প্ল্যাটফর্মগুলোর (Amazon, Daraz) মতো ফিচার থাকবে, কিন্তু লোকাল পেমেন্ট (SSLCommerz, bKash) এবং কুরিয়ার সাপোর্ট সহ।

## কারা ইউজ করবে?

| Role | কাজ |
|------|-----|
| **Customer** | প্রোডাক্ট দেখা, কার্টে যোগ, অর্ডার, পেমেন্ট, রিভিউ |
| **Seller (Merchant)** | প্রোডাক্ট ম্যানেজ, অর্ডার দেখবে, ইনভেন্টরি আপডেট |
| **Admin / Manager** | পুরো সিস্টেম ম্যানেজ — ইউজার, অর্ডার, পেমেন্ট, কন্টেন্ট |
| **Super Admin** | ফুল কন্ট্রোল — সবকিছু |

## কি কি ফিচার আছে?

### Customer Side
- প্রোডাক্ট ব্রাউজ (ক্যাটাগরি, সেকশন, সার্চ)
- শপিং কার্ট + উইশলিস্ট
- অর্ডার প্লেস (মাল্টি-মার্চেন্ট)
- SSLCommerz / bKash পেমেন্ট
- অর্ডার ট্র্যাকিং
- ক্যান্সেল/রিফান্ড/রিটার্ন রিকোয়েস্ট
- রিভিউ ও রেটিং
- মাল্টিপল অ্যাড্রেস

### Admin Dashboard
- **Analytics:** ইউজার স্ট্যাটিস্টিক, ব্যান্ডউইথ, ক্লাউডফ্লেয়ার, লোকেশন
- **Category CRUD:** ক্যাটাগরি ম্যানেজমেন্ট (সফট ডিলিট)
- **Product CRUD:** প্রোডাক্ট ম্যানেজমেন্ট (ড্রাফট/পাবলিশ)
- **Merchant CRUD:** সেলার ম্যানেজমেন্ট
- **Order Management:** অর্ডার লিস্ট, ডিটেল, ম্যানুয়াল অর্ডার
- **User Management:** ইউজার CRUD, রোল ম্যানেজ
- **Return/Refund:** রিকোয়েস্ট এপ্রুভ/রিজেক্ট/প্রসেস
- **Variant (Options):** ভ্যারিয়েন্ট ও অপশন ভ্যালু ম্যানেজ
- **Sections:** হোমপেজ সেকশন ম্যানেজ
- **Banners:** ব্যানার CRUD
- **Finance:** ট্রানজেকশন, রিফান্ড, ইনভয়েস, পেআউট
- **Settings:** সাইট সেটিংস, জেনারেল, সিকিউরিটি
- **Website:** ব্যানার, সেকশন, জেনারেল/অ্যাপিয়ারেন্স সেটিংস

## কতটুকু কমপ্লিট?

| Feature | Status |
|---------|--------|
| 🔐 Authentication | ✅ Complete (Register, Login, OTP, Sessions, Forgot/Reset) |
| 📦 Products (Customer) | ✅ Complete (List, Detail, Search, Sections, Cart, Wishlist) |
| 🛒 Orders | ✅ Complete (Create, Status Filters, Cancel/Refund Requests) |
| 💳 Payment | ✅ Complete (SSLCommerz Init + IPN) |
| 📊 Dashboard (Admin) | ✅ Complete (~62 endpoints, all modules) |
| ↩️ Refunds & Returns | ✅ Complete (create, approve, process, withdraw) |
| ⭐ Reviews | ✅ Complete (Submit, List, Reviewable Products) |
| 📝 Docs (OpenAPI) | ✅ Complete (6 registry chapters, auto-generated spec) |
| 📧 Email | ✅ Complete (Resend + SMTP fallback, 3 templates) |
| 🌍 Geo | ✅ Complete (IP geolocation, Bangladesh GeoJSON) |
| 📈 Bandwidth Tracking | ✅ Complete (middleware, dashboard widget) |

## টেক স্ট্যাক (সংক্ষিপ্ত)

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3.15.4 + Nitro 2.10.4 |
| Frontend | Vue 3, Tailwind, @nuxt/ui, shadcn-vue |
| Backend | Nitro (file-based, edge-ready) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (PKCE) |
| State | Pinia |
| Validation | Zod |
| Payment | SSLCommerz |
| Email | Resend / SMTP |
| Hosting | NuxtHub / Cloudflare Pages |
| Storage | External Express API (media.obotoronika.com) |
