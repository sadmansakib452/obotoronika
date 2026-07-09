<script setup lang="ts">
import { UTabs } from '#components'

const selectedTab = ref(0)

const items = [
  {
    label: 'All',
    slot: 'all',
  },
  {
    label: 'Processing',
    slot: 'processing',
  },
  {
    label: 'Shipped',
    slot: 'shipped',
  },
  {
    label: 'Delivered',
    slot: 'delivered',
  },
  {
    label: 'Cancelled',
    slot: 'cancelled',
  },
  {
    label: 'Returned',
    slot: 'returned',
  },
]
</script>

<template>
  <div class="mt-6">
    <div class="lg:hidden mb-4">
      <select
        :value="selectedTab"
        class="w-full border obotoronika-border-color rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-dark obotoronika-text-color"
        @change="selectedTab = Number(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="(item, idx) in items" :key="item.slot" :value="idx">
          {{ item.label }}
        </option>
      </select>
    </div>
    <div class="hidden lg:block">
      <UTabs v-model="selectedTab" :items="items">
      <template #all>
        <CustomerOrdersAll />
      </template>
      <template #processing>
        <CustomerOrdersProcessing />
      </template>
      <template #shipped>
        <CustomerOrdersShipped />
      </template>
      <template #delivered>
        <CustomerOrdersDelivered />
      </template>
      <template #cancelled>
        <CustomerOrdersCancelled />
      </template>
      <template #returned>
        <CustomerOrdersReturned />
      </template>
    </UTabs>
  </div>
</template>
