<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, computed, watch, shallowRef, markRaw } from 'vue'

const ranges = [
  { label: '5 Days', value: '5D', days: 5 },
  { label: '2 Weeks', value: '2W', days: 14 },
  { label: '1 Month', value: '1M', days: 30 },
  { label: '6 Months', value: '6M', days: 180 },
  { label: '1 Year', value: '1Y', days: 365 },
]

const selectedRange = ref<'5D' | '2W' | '1M' | '6M' | '1Y'>('1M')
const bandwidthData = ref<number[]>([])
const loading = ref(false)
const error = ref('')

const selectedDays = computed(() => {
  const r = ranges.find(r => r.value === selectedRange.value)
  return r ? r.days : 30
})

async function fetchBandwidth(days: number) {
  loading.value = true
  error.value = ''
  try {
    const { data, error: fetchError }: any = await useFetch(`/api/dashboard/analytics/bandwidth-usage?days=${days}`)
    if (fetchError.value) {
      error.value = fetchError.value.message || 'Fetch error'
      bandwidthData.value = []
    }
    else {
      // Expect data.value like [{ day: '2025-08-01', total_bytes: 12345 }, ...]
      bandwidthData.value = data.value?.data?.map((d: any) => d.total_bytes ?? 0) ?? []
    }
  }
  catch (err) {
    error.value = (err as Error).message || 'Unknown error'
    bandwidthData.value = []
  }
  finally {
    loading.value = false
  }
}

watch(selectedDays, (newDays) => {
  fetchBandwidth(newDays)
}, { immediate: true })

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: {
    tickAmount: 4,
    categories: bandwidthData.value.map((_, i) => `Day ${i + 1}`),
    labels: { show: false },
    axisTicks: { show: false },
    axisBorder: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#9CA3AF' },
      formatter: (val: number) => (val / (1024 * 1024)).toFixed(2),
    },

    // title: {
    // //   text: 'Bandwidth (MB)',
    //   rotate: 90,
    //   offsetX: 0,
    //   offsetY: 0,
    //   style: {
    //     color: '#9CA3AF',
    //     fontSize: '12px',
    //   },
    // },
  },
  tooltip: {
    y: {
      formatter: (val: number) => {
        const mb = val / (1024 * 1024)
        return mb.toFixed(2) + ' MB'
      },
    },
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
    name: 'Bandwidth Usage',
    data: bandwidthData.value,
  },
])

const VueApexCharts = shallowRef()

if (import.meta.client) {
  import('vue3-apexcharts').then((module) => {
    VueApexCharts.value = markRaw(module.default)
  })
}
</script>

<template>
  <AtomsWidgetCard
    class="h-[464px] @sm:h-[520px] @7xl:col-span-4 @7xl:col-start-9 @7xl:row-start-1 @7xl:row-end-3 @7xl:h-full flex flex-col"
    title="Bandwidth Usage"
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
    <div v-if="error" class="text-center mt-4 text-red-600">
      {{ error }}
    </div>
  </AtomsWidgetCard>
</template>
