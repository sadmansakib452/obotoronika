# Frontend 05: Styling & Design System

## CSS Framework

| Tool | Config |
|------|--------|
| **Tailwind CSS** | `@nuxtjs/tailwindcss` module |
| **@nuxt/ui** | v2.21.0, `ui.global: false` |
| **Custom CSS** | `app/assets/styles/main.css` |
| **Component CSS** | Scoped `<style>` + separate `.css` files |

## @nuxt/ui Configuration

```typescript
// nuxt.config.ts
ui: {
  global: false  // → সব UI কম্পোনেন্ট explicit import via #components
}
```

**ui.global: false** মানে হলো — `UButton`, `UModal`, `UDropdown` এগুলো automatic register হয় না। বরং:

```vue
<script setup>
import { UButton, UModal } from '#components'
</script>
```

কেন? Bundle size ছোট রাখার জন্য — শুধু যে কম্পোনেন্টগুলো actually ব্যবহার করা হয় সেগুলোই bundle-এ যায়।

## Design Resources

| File | Details |
|------|---------|
| `DESIGN.md` | `web-obotoronika/docs/` — ডিজাইন সিস্টেম ডক |
| `main.css` | Root styles, variables, utilities |

## Key Visual Elements

- **Primary Color:** #FC6A03 (ওরেঞ্জ — OTP email-এও ব্যবহার)
- **Layout:** Max-width container, sticky header
- **Responsive:** Mobile-first (Mobile sidebar, hamburger menu)
- **Dark Mode:** Supported (order status styles, dashboard)

## Component Libraries Used

| Library | Components | Source |
|---------|-----------|--------|
| **@nuxt/ui** | Button, Modal, Dropdown, Table, Badge, etc. | `#components` |
| **shadcn-vue** | Avatar, Dialog, Drawer, Command, Popover, ScrollArea, TagsInput, PinInput | `components/ui/` |
| **Custom** | Preloader, DatePicker, TextEditor, RatingProgressBar, ReviewCard | `components/` |

## Not Found in Codebase

- ✗ Nuxt Icon module (uses custom `Icon.vue` component instead)
- ✗ No CSS preprocessor (Sass/Less) — pure Tailwind + CSS
- ✗ No `@nuxtjs/color-mode` — dark mode handled manually

## Custom CSS Files

```
home/styles/          → Homepage section styles
dashboard/web-management/index.css  → Banner/section management
product-details/css/desc.css       → Product description layout
layouts/default/css/              → Header/footer styles
```
