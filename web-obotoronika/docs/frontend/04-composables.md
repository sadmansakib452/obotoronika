# Frontend 04: Composables (8 Files)

| Composable | Purpose |
|------------|---------|
| **useAuth** | Role-based auth guard, OAuth social login |
| **useCart** | ❌ Empty — placeholder (no logic yet) |
| **useCustomBodyScrollLock** | Body scroll lock/unlock (modal/drawer) |
| **useIsSticky** | Detect scroll position (sticky header) |
| **useLoginModal** | Login modal global state (open/close) |
| **useOrderStatusStyles** | Order status badge colors (dark mode support) |
| **usePendingActionAfterLogin** | SessionStorage bridge — পেন্ডিং অ্যাকশন (wishlist/cart) সেভ করে login এর পর execute |
| **useReturns** | Customer-side return/refund operations |

## Detailed Breakdown

### useAuth
- `fetchUserRole()` — `useSupabaseUser()` থেকে user role বের করে
- `socialLogin(provider)` — Facebook/Google OAuth login চালু করে
- Global state via `useState`

### useLoginModal
- `isOpen`, `open()`, `close()` — Navbar-এ login button চাপলে modal ওপেন হয়
- Uses `useState('loginModalOpen')` — cross-component

### useOrderStatusStyles
- Order status → color mapping
- Dark mode aware
- Stateless utility composable (no `ref`, no lifecycle)

### usePendingActionAfterLogin
- Login করার আগে user যদি product-add-to-cart চাপে → পেন্ডিং অ্যাকশন `sessionStorage`-এ সেভ
- Login complete হলে → action auto-execute
- Workaround for cart/wishlist login redirect

### useReturns
- Customer-facing return operations
- `fetchMyReturns()`, `fetchReturnDetails(id)`, `createReturn(data)`, `withdrawReturn(id)`, `checkRefundStatus(refundRefId)`
- Uses `$fetch` directly with envelope response check
- Local reactive state (`returnRequests`, `currentReturn`, `isLoading`, `error`)

## Pattern

| Pattern | Usage |
|---------|-------|
| `useState()` | Global cross-component state (loginModal, pendingAction) |
| `onMounted/onUnmounted` | DOM event listeners (scroll, body lock) |
| `$fetch` | Direct API calls (returns composable) |
| Stateless factory | Pure utility (orderStatusStyles) |
| Placeholder | Empty file (useCart — WIP) |
