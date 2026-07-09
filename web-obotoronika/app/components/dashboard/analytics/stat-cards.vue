<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
// @ts-ignore
import VueApexCharts from 'vue3-apexcharts'
import { cn } from '@/lib/utils'

const eComDashboardStatData = [
  {
    id: '1',
    icon: 'mdi:gift',
    title: 'New Orders',
    metric: '1,390',
    increased: true,
    decreased: false,
    percentage: '+32.40',
    style: 'text-blue-500',
    fill: '#3872FA',
    chart: [
      { day: 'Sunday', sale: 4000 },
      { day: 'Monday', sale: 3000 },
      { day: 'Tuesday', sale: 2000 },
      { day: 'Wednesday', sale: 2780 },
      { day: 'Thursday', sale: 1890 },
      { day: 'Friday', sale: 2390 },
      { day: 'Saturday', sale: 3490 },
    ],
  },
  {
    id: '2',
    icon: 'fluent:data-pie-24-regular',
    title: 'Sales',
    metric: '$57,890',
    increased: false,
    decreased: true,
    percentage: '-4.40',
    style: 'text-green-500',
    fill: '#10b981',
    chart: [
      { day: 'Sunday', sale: 2000 },
      { day: 'Monday', sale: 3000 },
      { day: 'Tuesday', sale: 2000 },
      { day: 'Wednesday', sale: 2780 },
      { day: 'Thursday', sale: 1890 },
      { day: 'Friday', sale: 2390 },
      { day: 'Saturday', sale: 3490 },
    ],
  },
  {
    id: '3',
    icon: 'mdi:bank',
    title: 'Revenue',
    metric: '$12,390',
    increased: true,
    decreased: false,
    percentage: '+32.40',
    style: 'text-purple-500',
    fill: '#7928ca',
    chart: [
      { day: 'Sunday', sale: 2000 },
      { day: 'Monday', sale: 2800 },
      { day: 'Tuesday', sale: 3500 },
      { day: 'Wednesday', sale: 2780 },
      { day: 'Thursday', sale: 1890 },
      { day: 'Friday', sale: 2390 },
      { day: 'Saturday', sale: 3490 },
    ],
  },
]

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
</script>

<template>
  <!-- <client-only> -->
  <div class="grid grid-cols-1 gap-5 3xl:gap-8 4xl:gap-9 @2xl:grid-cols-3 @3xl:gap-6 @4xl:col-span-2 @7xl:col-span-8">
    <div
      v-for="(stat) in eComDashboardStatData"
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
              {{ stat.metric }}
            </p>
          </div>
        </div>
        <client-only>
          <VueApexCharts
            type="bar"
            :options="chartOptions(stat.fill)"
            :series="[{ data: stat.chart.map((d) => d.sale) }]"
            height="100"
            width="100"
            class="!min-h-[80px] !max-h-[90px]"
          />
        </client-only>
      </div>
      <p
        class="flex items-center border-t border-dashed border-muted pt-4 leading-none text-sm dark:border-theme-border obotoronika-text-color"
      >
        <span
          :class="cn('me-2 inline-flex items-center font-medium', stat.increased ? 'text-green-500' : 'text-red-500')"
        >
          <Icon :name="stat.increased ? 'ph:caret-double-up-duotone' : 'ph:caret-double-down-duotone'" />
          {{ stat.percentage }}%
        </span>
        <span class="me-1 hidden @[240px]:inline-flex">
          {{ stat.increased ? 'Increased' : 'Decreased' }}
        </span>
        last month
      </p>
    </div>
  </div>
  <!-- </client-only> -->
</template>
