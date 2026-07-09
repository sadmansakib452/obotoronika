# Frontend 03: Pinia State Management (12 Stores)

## Store List

| Store | File | State | Key Actions |
|-------|------|-------|-------------|
| **useAuthStore** | `auth.ts` | `user`, `isLoading`, `userRole`, `sessions` | `fetchUser()`, `signUp()`, `signIn()`, `signOut()`, `getSessions()` |
| **useProductsStore** | `products.ts` | `featuredProducts`, `wishlist`, `cart`, `unavailableCart`, `totalCartItems`, `productsWishlist`, `totalWishlistItems`, `sectionProducts`, `variants` | `fetchFeaturedProducts()`, `fetchCart()`, `addToCart()`, `removeCart()`, `fetchWishlist()`, `addWishlist()`, etc. |
| **useOrderStore** | `orders.ts` | `orders`, `processing`, `shipped`, `delivered`, `cancelled`, `returned` (each with data+pagination) | `getOrders()`, `getProcessingOrders()`, ... + counts |
| **useDashboardStore** | `dashboard.ts` | `orders` (paginated), `products` (paginated+filter), `categories` (paginated) | `fetchDashboardOrders()`, `fetchProducts()`, `fetchCategories()` |
| **useFinanceStore** | `finance.ts` | `invoices`, `transactions`, `refunds`, `cancellations` (cached paginated) | Fetch, search, filter, approve/reject refunds |
| **useReturnsStore** | `returns.ts` | `returns` (cached paginated+search+filter) | `fetchReturns()`, `approveReturn()`, `rejectReturn()`, `markReceived()`, `processRefund()` |
| **useAnalyticsStore** | `adminAnalytics.ts` | `userStats`, `cloudFlareStats`, `visitor`, `isLoading` | `fetchUserAnalytics()`, `fetchCloudFlareStats()`, `fetchUserVisitorStats()`, `fetchDashboardStats()` |
| **useReviewStore** | `reviews.ts` | `to_reviews` (paginated), `reviews` | `getToReviews()`, `getReviews()` |
| **useUserStore** | `user.ts` | `addresses`, `address` (default), `isLoading` | `getAddresses()`, `getAddress()` |
| **useSettingsStore** | `settings.ts` | `isPageLoading`, `isError`, `errorMessage`, `menu` | `setIsPageLoading()`, `getMenu()` |
| **useVariantStore** | `variants.ts` | `variants`, `options`, `product_variants` | `getVariants()`, `getOptions(id)`, `getProductVariants()` |
| **useUiStore** | `ui.ts` | `sidebarOpen` | `toggleSidebar()`, `closeSidebar()` |

## Caching Pattern

লিস্ট এন্ডপয়েন্টের জন্য পেজ-ক্যাশিং প্যাটার্ন:

```typescript
state: {
  data: {} as Record<string, any[]>,
  pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 }
}

// Cache key
const pageKey = `${page}-${perPage}-${search}-${filter}`
if (data[pageKey]) return // already cached
data[pageKey] = result
```

কোন স্টোরগুলো এই প্যাটার্ন ব্যবহার করে: `useFinanceStore`, `useReturnsStore`, `useDashboardStore`, `useOrderStore`, `useProductsStore`

## Externalized Actions (products)

`useProductsStore`-এর actions আলাদা ফাইলে রাখা হয়েছে:

```
app/stores/actions/productsActions.ts
```

এতে আছে: `fetchFeaturedProducts`, `fetchWishlist`, `addWishlist`, `removeWishlist`, `fetchCart`, `addToCart`, `removeCart`, `updateCartQuantity`, `removeFromCart`, `removeCartMany`, `fetchWishlistCount`, `fetchCartCount`, `fetchProductWishlist`, `fetchSectionProducts`, `fetchProducts`, `addVariant`

**কেন?** — products store সবচেয়ে বড়, actions আলাদা করে store cleaner রাখা হয়েছে।

## Types

```
app/stores/types/
├── products.d.ts   → Product, CartItem, Section, ProductsStateData, ProductsActions, Meta
└── orders.d.ts     → Order, OrderItem, OrdersResponse
```

## Auto-import

Nuxt 3 + @pinia/nuxt → stores auto-imported হয়। কোনো manually import দরকার নেই।

```vue
<script setup>
const authStore = useAuthStore()  // auto-imported
const { user, isLoading } = storeToRefs(authStore)
await authStore.fetchUser()
</script>
```
