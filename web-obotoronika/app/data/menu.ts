const mainMenu = [
  {
    name: 'Dashboard',
    href: '/dashboard/analytics',
    icon: 'mage:dashboard-fill',
    role: ['super_admin', 'admin', 'manager', 'seller'],
  },
  {
    name: 'Products',
    href: '#',
    icon: 'fluent-mdl2:product-variant',
    role: ['super_admin', 'admin', 'manager', 'seller'],
    dropdownItems: [
      {
        name: 'Product List',
        href: '/dashboard/products',
        icon: 'codicon:github-project',
        role: ['super_admin', 'admin', 'manager', 'seller'],
      },
      {
        name: 'Add Product',
        href: '/dashboard/products/new',
        icon: 'pajamas:project',
        role: ['super_admin', 'admin', 'manager', 'seller'],
      },
      {
        name: 'Manage Variants',
        href: '/dashboard/variants',
        icon: 'material-symbols:format-paint-rounded',
        role: ['super_admin', 'admin'],
      },
    ],
  },
  {
    name: 'Categories',
    href: '#',
    icon: 'material-symbols:category-outline-rounded',
    role: ['admin'],
    dropdownItems: [
      {
        name: 'Category List',
        href: '/dashboard/categories',
        icon: 'codicon:github-project',
        role: ['super_admin', 'admin'],
      },
      {
        name: 'Create Category',
        href: '/dashboard/categories/new',
        icon: 'pajamas:project',
        role: ['super_admin', 'admin', 'manager', 'seller'],
      },
    ],
  },
  {
    name: 'Orders',
    href: '#',
    icon: 'mdi:cart-outline',
    role: ['super_admin', 'admin', 'manager', 'seller'],
    dropdownItems: [
      {
        name: 'Order List',
        href: '/dashboard/orders',
        role: ['super_admin', 'admin', 'manager', 'seller'],
      },
      {
        name: 'Create Order',
        href: '/dashboard/orders/new',
        role: ['super_admin', 'admin', 'manager', 'seller'],
      },
    ],
  },
  {
    name: 'Website Management',
    href: '#',
    icon: 'material-symbols:web',
    role: ['admin', 'manager', 'seller'],
    dropdownItems: [
      {
        name: 'Sections',
        href: '/dashboard/website/sections',
        role: ['admin', 'super_admin'],
      },
      {
        name: 'Banners',
        href: '/dashboard/website/banners',
        role: ['admin', 'super_admin', 'manager'],
      },
      {
        name: 'Settings',
        href: '/dashboard/website/settings/general',
        role: ['admin', 'super_admin'],
      },
    ],
  },
  {
    name: 'Merchants',
    href: '/dashboard/merchants',
    icon: 'uim:house-user',
    role: ['super_admin', 'admin', 'manager', 'seller'],
  },
  {
    name: 'Finance',
    href: '#',
    icon: 'solar:wallet-outline',
    role: ['super_admin', 'admin', 'manager', 'seller'],
    dropdownItems: [
      {
        name: 'Transactions',
        href: '/dashboard/finance/transactions',
        icon: 'tabler:transaction-dollar',
        role: ['super_admin', 'admin', 'manager', 'seller'],
      },
      {
        name: 'Payouts',
        href: '/dashboard/finance/payouts',
        icon: 'icon-park-outline:pay-code-one',
        role: ['super_admin', 'admin'],
      },
      {
        name: 'Refunds & Cancellations',
        href: '/dashboard/finance/refunds',
        icon: 'mdi:cash-refund',
        role: ['super_admin', 'admin', 'manager'],
      },
      {
        name: 'Invoices',
        href: '/dashboard/finance/invoices',
        icon: 'mdi:file-document-outline',
        role: ['super_admin', 'admin', 'manager'],
      },
    ],
  },
  {
    name: 'Manage User',
    href: '/dashboard/users',
    icon: 'fa6-solid:users-gear',
    role: ['super_admin', 'admin', 'manager'],
  },
  {
    name: 'Settings',
    href: '#',
    icon: 'heroicons:cog-8-tooth',
    role: ['super_admin', 'admin', 'manager'],
    dropdownItems: [
      {
        name: 'General',
        href: '/dashboard/settings/general',
        role: ['super_admin', 'admin', 'manager'],
      },
{
        name: 'Notifications',
        href: '/dashboard/settings/notifications',
        role: ['super_admin', 'admin', 'manager'],
      },
      {
        name: 'Security',
        href: '/dashboard/settings/security',
        role: ['super_admin', 'admin'],
      },
    ],
  },
]

export default mainMenu
