<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import VueApexCharts from 'vue3-apexcharts'
import { cn } from '@/lib/utils'
import { useAnalyticsStore } from '@/stores/adminAnalytics'
import { UPagination, UTable } from '#components'

const store = useAnalyticsStore()

const { userStats } = storeToRefs(store)

const usersStatsData = computed(() => [
  {
    id: 1,
    title: 'Total Users',
    value: 100,
    icon: 'mdi:users',
    chart: userStats.value.total.charts,
    class: 'text-blue-500',
    fill: '#10b981',
    increased: userStats.value.total.increased,
    percentage: 10,
    total: userStats.value.total.count,
  },
  {
    id: 2,
    title: 'Total Customers',
    value: 100,
    icon: 'mdi:users',
    chart: userStats.value.customer.charts,
    class: 'text-blue-500',
    fill: '#7928ca',
    increased: userStats.value.total.increased,
    percentage: 10,
    total: userStats.value.customer.count,
  },
  {
    id: 3,
    title: 'Total Sellers',
    value: 100,
    icon: 'mdi:users',
    chart: userStats.value.seller.charts,
    class: 'text-blue-500',
    fill: '#3872FA',
    increased: userStats.value.total.increased,
    percentage: 10,
    total: userStats.value.seller.count,
  },
])

const chartOptions = (color: string) => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '50%',
      borderRadius: 2,
    },
  },
  colors: [color],
  xaxis: {
    categories: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  grid: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
})

const page = ref(1)

const { data, pending, error } = useFetch<SuccessResponse>('/api/dashboard/users', {
  query: { perPage: 5, page },
  watch: [page],
  lazy: true,
})

const users = computed(() => {
  return (data.value?.data?.users || []).map((item: any) => ({
    name: item?.name,
    email: item.email,
    role: item?.user_metadata?.role?.split('_').join(' ').toUpperCase(),
    status: item?.status?.toUpperCase(),
  }))
})
</script>

<template>
  <div class="grid grid-cols-1 gap-6 @4xl:grid-cols-2 @7xl:grid-cols-12 3xl:gap-8 mt-8">
    <div
      class="grid grid-cols-1 gap-5 3xl:gap-8 4xl:gap-9 @2xl:grid-cols-3 @3xl:gap-6 @4xl:col-span-2 @7xl:col-span-8"
    >
      <div
        v-for="(stat) in usersStatsData"
        :key="stat.id"
        class="border obotoronika-border-color bg-gray-0 p-5 bg-white dark:bg-dark lg:p-6 rounded-lg @container [&>div]:items-center"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 lg:h-12 lg:w-12 text-2xl dark:bg-theme-border"
              :style="{ color: stat.fill }"
            >
              <AtomsIcon :name="stat.icon" />
            </div>
            <div class="ps-3">
              <p class="mb-0.5 text-gray-500 text-sm font-semibold">
                {{ stat.title }}
              </p>
              <p class="font-lexend text-lg font-semibold 2xl:xl:text-xl obotoronika-text-color">
                {{ stat.total }}
              </p>
            </div>
          </div>
          <client-only>
            <VueApexCharts
              type="bar"
              :options="chartOptions(stat.fill)"
              :series="[{ data: stat.chart.map((d) => d.total) }]"
              height="100"
              width="100"
              class="!min-h-[80px] !max-h-[90px]"
            />
          </client-only>
        </div>
        <client-only>
          <p
            class="flex items-center border-t border-dashed border-muted pt-4 leading-none text-sm dark:border-theme-border obotoronika-text-color"
          >
            <span
              :class="cn('me-2 inline-flex items-center font-medium', stat.increased ? 'text-green-500' : 'text-red-500')"
            >
              <AtomsIcon :name="stat.increased ? 'ph:caret-double-up-duotone' : 'ph:caret-double-down-duotone'" />
              {{ stat.percentage }}%
            </span>
            <span class="me-1 hidden @[240px]:inline-flex">
              {{ stat.increased ? 'Increased' : 'Decreased' }}
            </span>
            last month
          </p>
        </client-only>
      </div>
    </div>
    <div
      class="relative rounded-lg bg-white p-5 sm:p-6 lg:p-7  border obotoronika-border-color pb-8 @4xl:col-span-2 @7xl:col-span-8 lg:pb-9 dark:bg-dark h-[360px] overflow-y-auto flex flex-col justify-between"
    >
      <div>
        <h2 class="mb-2 text-lg sm:mb-3 font-semibold font-poppins obotoronika-text-color">
          Recent Users
        </h2>
        <div v-if="error" class="text-center py-8 text-gray-400 text-sm">
          Unable to load users.
        </div>
        <UTable v-else :rows="users" :ui="{ wrapper: 'border-none rounded-none' }" :loading="pending" />
      </div>
      <UPagination
        v-model="page"
        :page-count="5"
        :total="data?.data?.total ?? 0"
        class="ml-auto"
      />
    </div>
    <DashboardAnalyticsUserLocation />
  </div>
</template>
