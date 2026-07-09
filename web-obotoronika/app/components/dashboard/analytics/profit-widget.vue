<script lang="ts" setup>
import { ref, computed } from 'vue'

const selectedRange = ref<'5D' | '2W' | '1M' | '6M' | '1Y'>('1M')

const VueApexCharts = ref()
if (import.meta.client) {
  VueApexCharts.value = (await import('vue3-apexcharts')).default
}

const ranges = [
  { label: '5 Days', value: '5D' },
  { label: '2 Weeks', value: '2W' },
  { label: '1 Month', value: '1M' },
  { label: '6 Months', value: '6M' },
  { label: '1 Year', value: '1Y' },
]

// Mock data for different ranges (replace with actual API response if needed)
const chartDataMap: Record<'5D' | '2W' | '1M' | '6M' | '1Y', number[]> = {
  '5D': [45, 52, 38, 45, 56],
  '2W': [32, 42, 35, 45, 48, 50, 60, 55, 59, 63, 62, 70, 72, 75],
  '1M': Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
  '6M': Array.from({ length: 6 }, () => Math.floor(Math.random() * 100)),
  '1Y': Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
}

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: {
    categories: Array(chartDataMap[selectedRange.value].length).fill('').map((_, i) => `Day ${i + 1}`),
    labels: { show: false },
    axisTicks: { show: false },
    axisBorder: { show: false },
  },
  yaxis: {
    labels: { style: { colors: '#9CA3AF' } },
  },
  colors: ['#3B82F6'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
      stops: [0, 90, 100],
    },
  },
}))

const chartSeries = computed(() => [
  {
    name: 'Sales',
    data: chartDataMap[selectedRange.value],
  },
])
</script>

<template>
  <AtomsWidgetCard
    class="h-[464px] @sm:h-[520px] @7xl:col-span-4 @7xl:col-start-9 @7xl:row-start-1 @7xl:row-end-3 @7xl:h-full flex flex-col"
    title="Total Profit"
    title-class-name="text-gray-500 font-normal font-inter !text-sm"
  >
    <div class="flex justify-end gap-2 my-4">
      <button
        v-for="range in ranges"
        :key="range.value"
        class="px-3 py-1 text-xs rounded border"
        :class="selectedRange === range.value ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-500'"
        @click="selectedRange = range.value"
      >
        {{ range.label }}
      </button>
    </div>
    <client-only>
      <component
        :is="VueApexCharts"
        width="100%"
        height="100%"
        type="area"
        :options="chartOptions"
        :series="chartSeries"
      />
    </client-only>
  </AtomsWidgetCard>
</template>
