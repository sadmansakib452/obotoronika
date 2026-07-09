<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { useDashboardStore } from '@/stores/dashboard'
import { UBreadcrumb, UButton } from '#components'

// Navigation links
const links = [
  {
    label: 'Orders',
    icon: 'i-heroicons-shopping-cart',
    to: '/dashboard/orders',
  },
  { label: 'List', icon: 'i-heroicons-list-bullet' },
]

const store = useDashboardStore()

// Prevent duplicate fetch on SSR hydration
await callOnce('dashboard-orders-fetch', () => store.fetchDashboardOrders())
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <UBreadcrumb title="Products" :links="links" />
      <UButton
        label="Create Order"
        size="lg"
        icon="i-heroicons-plus"
        block
        class="w-40 h-fit"
        color="black"
        to="/dashboard/orders/new"
      />
    </div>
    <DashboardOrdersTable />
  </div>
</template>
