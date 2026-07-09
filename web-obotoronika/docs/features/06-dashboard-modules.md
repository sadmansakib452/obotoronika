# Feature 06: Dashboard Modules

Dashboard is the largest feature — ~62 endpoints + 27 pages + 16 components.

## Module Map

```
Dashboard
├── Analytics        → Stats, charts, bandwidth, Cloudflare, location
├── Categories       → CRUD + soft delete + bulk delete + undo
├── Products         → CRUD + save-as-draft + has-slug check
├── Merchants        → CRUD + soft delete + undo
├── Orders           → List, create manual, detail, status update
├── Users            → CRUD + addresses + role management
├── Variants         → Option CRUD + Option Value CRUD
├── Sections         → CRUD + batch activate/deactivate
├── Banners          → CRUD
├── Returns          → List, detail, approve, reject, mark-received
├── Settings         → Website general settings
└── Finance
    ├── Transactions  → List
    └── Refunds       → List, detail, approve/reject (SSLCommerz)
```

## Dashboard Components

```
dashboard/
├── analytics/     → 7 widgets (bandwidth, cloudflare, stats, location, etc.)
├── categories/    → Form.vue
├── finance/       → InvoiceDetailsTable.vue, transaction-details.vue
├── merchants/     → MerchantsForm.vue
├── orders/        → Table.vue, DetailsTable.vue
├── products/      → ProductForm.vue, Variants/ (Index, Option)
├── returns/       → ReturnsTable.vue
├── settings/      → LoggedDevices.vue, Navigators.vue
├── user/          → Form.vue
└── web-management/ → BannerForm, BannerManagement, SectionForm, SectionManagement
```

## Page Layout

```
/dashboard/
├── analytics                    → Overview charts
├── categories                   → CRUD table + form modal
├── products                     → CRUD table + product form
├── merchants                    → CRUD table + merchant form
├── orders                       → Order table + detail + manual create
├── users                        → User CRUD table + form
├── variants                     → Option management
├── returns                      → Return requests + approval
├── settings/general             → Site settings
├── website/banners              → Banner management
├── website/sections             → Section management
└── finance/
    ├── transactions             → Transaction log
    ├── refunds                  → Refund management
    ├── cancellations            → Cancellation requests
    ├── invoices                 → Invoice list + detail
    └── payouts                  → Payout management
```

## Auth Holes Found

| Endpoint | Issue |
|----------|-------|
| `GET /api/dashboard/analytics/bandwidth-usage` | No auth check |
| `GET /api/dashboard/analytics/user-location-summary` | No auth check |
| `GET /api/dashboard/products/has-slug` | No auth check |
