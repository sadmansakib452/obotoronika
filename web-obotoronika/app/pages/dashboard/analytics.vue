<script lang="ts" setup>
import { UDivider } from '#components'

definePageMeta({
  roles: ['super_admin', 'admin', 'manager', 'seller'],
})

const store = useAnalyticsStore()
const { role } = useAuth()

callOnce('adminAnalytics', async () => await store.fetchDashboardStats())

useHead({
  title: 'Analytics | Obotoronika',
})
</script>

<template>
  <div class="@container">
    <div class="grid grid-cols-1 gap-6 @4xl:grid-cols-2 @7xl:grid-cols-12 3xl:gap-8 mb-8">
      <DashboardAnalyticsWelcome />
      <DashboardAnalyticsStatCards />
      <!-- <DashboardAnalyticsProfitWidget /> -->
      <DashboardAnalyticsBandwidthUsageWidget />
    </div>
    <UDivider v-if="role.includes('admin')" />
    <DashboardAnalyticsCloudflare v-if="role.includes('admin')" />
    <DashboardAnalyticsUsersState v-if="role.includes('admin')" />
  </div>
</template>
