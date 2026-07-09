<script lang="ts" setup>
import { useOrderStore } from '@/stores/orders'

import { UPagination } from '#components'

const store = useOrderStore()

const handlePageChange = (page: number) => {
  store.setCancelledPagination(
    page,
    store.cancelled.pagination.perPage,
  )
}

onMounted(async () => {
  await store.getCancelledOrders()
})
</script>

<template>
  <div>
    <div v-if="store.cancelled.isLoading" class="mt-4">
      loading
    </div>
    <div v-else class="mt-4">
      <div class="hidden lg:block overflow-x-auto">
        <table class="w-full">
        <thead>
          <tr class="border-b obotoronika-border-color">
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider obotoronika-muted-text">Order</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider obotoronika-muted-text">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider obotoronika-muted-text">Products</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider obotoronika-muted-text">Total</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider obotoronika-muted-text">Payment</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider obotoronika-muted-text">Actions</th>
          </tr>
        </thead>
        <tbody>
          <CustomerOrdersOrderItem
            v-for="item in store.cancelled.data"
            :key="item.order_id"
            :item="item"
          />
        </tbody>
      </table>
      </div>
      <div class="lg:hidden space-y-3">
        <CustomerOrdersOrderMobileCard v-for="item in store.cancelled.data" :key="item.order_id" :item="item" />
      </div>
      <div v-if="!store.cancelled.data.length" class="text-center py-8 obotoronika-muted-text text-sm">
        No cancelled orders found.
      </div>
    </div>
    <!-- Pagination -->
    <div class="flex justify-end px-3 py-3.5 mt-4">
      <UPagination
        v-model="store.cancelled.pagination.page"
        :page-count="store.cancelled.pagination.perPage"
        :total="store.cancelled.pagination.total"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>
