# API 05: Dashboard (Admin) — ~62 Endpoints

সব ড্যাশবোর্ড endpoint-এ `checkUserRole()` দিয়ে auth করা। বেশিরভাগ CRUD অপারেশন। 

## Modules

### Banners (4)
| Method | Path | কী করে |
|--------|------|--------|
| GET | `/api/dashboard/banners` | লিস্ট (সব, not just active) |
| POST | `/api/dashboard/banners` | ক্রিয়েট (FormData + base64 image) |
| PATCH | `/api/dashboard/banners/[id]` | আপডেট |
| DELETE | `/api/dashboard/banners/[id]` | ডিলিট |

**Allowed:** super_admin, admin, manager

### Analytics (4)
| Method | Path | কী করে | Auth |
|--------|------|--------|------|
| GET | `/api/dashboard/analytics/admin` | ইউজার কাউন্ট বাই রোল + last 7 days | ✅ |
| GET | `/api/dashboard/analytics/bandwidth-usage` | ব্যান্ডউইথ (RPC) | 🚫 **NO AUTH** |
| GET | `/api/dashboard/analytics/cloudflare` | Cloudflare GraphQL API | ✅ |
| GET | `/api/dashboard/analytics/user-location-summary` | ইউজার লোকেশন | 🚫 **NO AUTH** |

### Categories (7)
Full CRUD: List, Create, Bulk Delete, Get :id, Update :id, Delete :id, Undo-delete
**Allowed:** super_admin, admin, manager (some seller)

### Merchants (5)
Full CRUD: List, Create, Update :id, Delete :id (soft), Undo-delete
**Allowed:** super_admin, admin, manager

### Orders (4)
| Method | Path | কী করে |
|--------|------|--------|
| GET | `/api/dashboard/orders` | লিস্ট (merchant_order_view) |
| POST | `/api/dashboard/orders` | ম্যানুয়াল অর্ডার ক্রিয়েট |
| GET | `/api/dashboard/orders/[id]` | ডিটেল (RPC) |
| PATCH | `/api/dashboard/orders/[id]` | স্ট্যাটাস আপডেট |

### Products (8)
Full CRUD + has-slug check + save-draft
**Note:** `GET /api/dashboard/products/has-slug` — **no auth!**

### Variants + Options (9)
Variants CRUD (6) + Option Values CRUD (3)
**Allowed:** super_admin, admin, manager, seller

### Returns (5)
List, Detail, Approve, Reject, Mark-received
**Allowed:** super_admin, admin

### Sections (4)
CRUD + Manage (activate/deactivate batch)
**Allowed:** super_admin, admin, manager

### Users (6)
CRUD + Addresses list
**Allowed:** super_admin, admin, manager

### Settings (2)
Website General: GET + POST (upsert)
**Allowed:** super_admin, admin, manager

### Finance: Refunds (3)
List, Detail, Approve/Reject (calls SSLCommerz API)
**Allowed:** super_admin, admin, manager

### Finance: Transactions (1)
List (paginated, RPC-based)

## Allowed Roles Summary

| Role | Access |
|------|--------|
| **super_admin** | সবকিছু |
| **admin** | সবকিছু (minus some super_admin specific ops) |
| **manager** | Most CRUD, not merchant/user delete, not analytics |
| **seller** | Limited: products, orders (own), variants, sections, categories |
