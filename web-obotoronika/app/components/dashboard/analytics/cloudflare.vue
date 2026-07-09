<script lang="ts" setup>
import VueApexCharts from 'vue3-apexcharts'

const store = useAnalyticsStore()

const { cloudFlareStats } = storeToRefs(store)

const statsData = [
  {
    id: '1',
    title: 'Unique Visitors',
    metric: '148',
    fill: '#10b981',
    chart: cloudFlareStats.value.visitor.data,
    total: cloudFlareStats.value.visitor.total,
    categories: cloudFlareStats.value.visitor.categories,
  },
  {
    id: '2',
    title: 'Total Requests',
    metric: '148',
    fill: '#FF5733',
    chart: cloudFlareStats.value.request.data,
    total: cloudFlareStats.value.request.total,
    categories: cloudFlareStats.value.request.categories,
  },
  {
    id: '3',
    title: 'Percent Cached',
    metric: '148',
    fill: '#3872FA',
    chart: cloudFlareStats.value.cached.data,
    total: cloudFlareStats.value.cached.total,
    categories: cloudFlareStats.value.cached.categories,
  },
]

const chartOPtions = (color: string, categories: string[]) => ({
  chart: {
    height: 350,
    type: 'line',
    zoom: {
      enabled: false,
    },
    toolbar: { show: false },
  },
  stroke: {
    curve: 'straight',
  },
  colors: [color],
  xaxis: {
    categories: categories,
    labels: { show: false },
  },
  dataLabels: {
    enabled: false,
  },
})
</script>

<template>
  <div class="grid grid-cols-1 gap-6 @4xl:grid-cols-2 @7xl:grid-cols-12 3xl:gap-8 mt-8 w-full">
    <div
      class="grid grid-cols-1 gap-5 3xl:gap-8 4xl:gap-9 @2xl:grid-cols-3 @3xl:gap-6 @4xl:col-span-2 @7xl:col-span-12 w-full"
    >
      <div
        v-for="(stat) in statsData"
        :key="stat.id"
        class="border obotoronika-border-color bg-gray-0 bg-white dark:bg-dark rounded-lg @container [&>div]:items-center w-full"
      >
        <p class="text-gray-500 text-sm font-semibold px-4 pt-4">
          {{ stat.title }} ({{ stat.total }})
        </p>
        <client-only>
          <VueApexCharts
            type="line"
            height="200"
            :options="chartOPtions(stat.fill, stat.categories)"
            :series="[{ data: stat.chart.map((d) => d) }]"
          />
        </client-only>
      </div>
    </div>
  </div>
</template>
