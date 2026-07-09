# Obotoronika Design System

> **Framework:** Nuxt 3 + Nuxt UI v2.21 + Tailwind CSS  
> **Font:** Poppins (body) + Homenaje (display)  
> **Design philosophy:** Bold orange accent on neutral canvas. Clean, e-commerce-first. Dark mode supported everywhere.

---

## Colors

### Brand

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| Primary | `#FC6A03` | `orange-400/500/600` | All CTAs, active states, badges, links |
| Primary Light | `#FFF5E6` | `orange-50` | Highlight backgrounds, selected rows |
| Primary Dark | `#CC7201` | `orange-700` | Press/hover states |

### Surface

| Token | Tailwind | Use |
|---|---|---|
| Light background | `bg-background` / `white` | Default page canvas |
| Dark background | `dark:bg-dark` / `#151520` | Dashboard, dark sections |
| Card | `bg-card` | Cards, modals, dropdown panels |
| Border | `obotoronika-border-color` | Card borders, input borders |

### Text

| Token | Tailwind | Hex (light) | Hex (dark) |
|---|---|---|---|
| Title | `obotoronika-title` | `gray-900` | `#CDCDD3` |
| Body | `obotoronika-text-color` | `gray-700` | `#CDCDE6` / `dark-text` |
| Muted | `obotoronika-muted-text` | `gray-500` | `gray-400` |
| Heading dark | `obotoronika-title` | — | `#CDCDD3` |

### Functional

| Token | Tailwind | Use |
|---|---|---|
| Success | `green-*` | Approved status, success toasts |
| Warning | `yellow-*` / `amber-*` | Pending status |
| Error | `red-*` / `rose-*` | Rejected, error states |
| Info | `blue-*` | Processing, information |

---

## Typography

### Font Families

| Role | Stack |
|---|---|
| **Body / UI** | `Poppins, sans-serif` |
| **Display / Headings** | `Homenaje, sans-serif` (used sparingly in hero titles) |

Tailwind: `font-poppins` (global default), `font-Homenaje` (headings)

### Hierarchy

| Level | Class | Weight | Use |
|---|---|---|---|
| Page Title | `text-3xl font-bold obotoronika-title` | 700 | Auth pages, section headers |
| Section Heading | `text-2xl font-semibold` | 600 | Dashboard cards |
| Card Title | `text-lg font-medium` | 500 | Product names |
| Body | `text-base` | 400 | Descriptions, paragraphs |
| Caption | `text-sm text-gray-500` | 400 | Secondary info |
| Fine Print | `text-xs` | 400 | Meta, timestamps |

**Font weights available:** 100–900 (Poppins loaded with all weights)

---

## Spacing

| Token | Value | Use |
|---|---|---|
| Content wrapper | `w-11/12 mx-auto` | Page content container |
| Card padding | `p-4` to `p-6` | Cards, modals |
| Section gap | `gap-4` to `gap-6` | Flex/grid layouts |
| Page margin | `my-8` / `py-10` | Page top/bottom |

---

## Layout

### Containers

- **Default page:** `max-w-lg` centered card (auth pages)
- **Dashboard:** Full-width with sidebar
- **Product grid:** Responsive grid — `lg:grid-cols-4 xl:grid-cols-5`
- **Content area:** `w-11/12 mx-auto lg:w-10/12`

### Responsive Breakpoints

| Name | Width | Tailwind |
|---|---|---|
| Extra small | 480px | `xs:` |
| Small | 640px | `sm:` |
| Medium | 768px | `md:` |
| Large | 1024px | `lg:` |
| Extra large | 1280px | `xl:` |
| 2XL | 1536px | `2xl:` |

---

## Components

### Buttons

All buttons use **Nuxt UI `UButton`** with explicit import.

```vue
import { UButton } from '#components'
```

| Variant | Props | Use |
|---|---|---|
| Primary | `color="primary"` | Main CTAs |
| Secondary | `color="gray" variant="solid"` | Utility actions |
| Ghost | `color="gray" variant="ghost"` | Minimal actions |
| Outline | `color="white" variant="outline"` | Dark backgrounds |
| Soft | `color="green/red" variant="soft"` | Approve/Reject |

**Size scale:** `xs` → `sm` → `md` → `lg` → `xl`

### Forms & Inputs

All inputs use **Nuxt UI `UInput`**.

```vue
import { UInput, UFormGroup } from '#components'
```

- **Label:** `text-sm font-semibold text-gray-600 dark:text-dark-text`
- **Input:** `size="lg"` default for forms
- **Error:** `text-red-600 text-sm` below input

### Cards

- **Border:** `border obotoronika-border-color rounded-md`
- **Background:** `bg-white dark:bg-dark`
- **Padding:** `p-4` to `p-6`

### Badges (Status)

```vue
import { UBadge } from '#components'
```

| Status | Color |
|---|---|
| Pending | `yellow` |
| Processing | `blue` |
| Shipped | `indigo` |
| Delivered / Completed | `green` / `teal` |
| Canceled | `red` |
| Refunded | `pink` |
| Returned | `rose` |

### Table

```vue
import { UTable } from '#components'
```

- Column slots: `#column_key-data="{ row }"`
- Pagination: `UPagination` component below table
- Loading: `:loading="store.isLoading"`

### Modals

```vue
import { UModal } from '#components'
```

- Width: `w-full sm:max-w-md`
- Title: `font-Homenaje text-xl obotoronika-title`
- Actions: `flex justify-end gap-3`

### Navigation

- **Breadcrumb:** `UBreadcrumb` with links array
- **Pagination:** `UPagination` with `v-model` + `@update:model-value`

---

## Layouts

### `default.vue`
- Public-facing pages: homepage, product listing, auth, user pages
- Header with nav + cart/wishlist icons
- Content area with padding

### `dashboard.vue`
- Admin/manager dashboard
- Sidebar navigation + main content area
- Collapsible sidebar on mobile

---

## CSS Utilities

Custom Tailwind utilities defined in `tailwind.config.js`:

| Class | Light | Dark |
|---|---|---|
| `obotoronika-text-color` | `text-gray-700` | `dark:text-dark-text` |
| `obotoronika-border-color` | `border-gray-200` | `dark:border-[#232533]` |
| `obotoronika-title` | `text-gray-900` | `dark:text-[#CDCDD3]` |
| `obotoronika-text` | `text-gray-700` | `dark:text-[#92929F]` |
| `obotoronika-muted-text` | `text-gray-500` | `dark:text-gray-400` |

**Always use these utility classes** instead of raw Tailwind color values for text and borders — they handle dark mode automatically.

---

## Nuxt UI Import Rule

```typescript
// ✅ CORRECT
import { UButton, UInput, UModal, UTable, UBadge, UDropdown } from '#components'

// ❌ WRONG — auto-imports disabled (ui.global: false)
// Using without explicit import will fail
```

---

## Do's and Don'ts

### Do
- Use `obotoronika-text-color`, `obotoronika-title` for text — dark mode auto-handled
- Import ALL Nuxt UI components explicitly from `#components`
- Use `color="primary"` for all main CTAs
- Use status badge colors consistently (yellow=pending, green=approved, red=rejected)
- Dark backgrounds use `bg-dark` (`#151520`)
- Form inputs default to `size="lg"`

### Don't
- Don't use raw gray-700/gray-900 without the `obotoronika-*` utility — breaks dark mode
- Don't rely on Nuxt UI auto-imports — they're disabled
- Don't mix shadow types — cards use borders, not shadows
- Don't use colors outside the defined palette without good reason
- Don't use inline styles — use Tailwind classes
