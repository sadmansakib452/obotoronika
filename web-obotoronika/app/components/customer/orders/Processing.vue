<script lang="ts" setup>
import { useOrderStore } from '@/stores/orders'

import { UPagination } from '#components'

const store = useOrderStore()

const handlePageChange = (page: number) => {
  store.setProcessingPagination(
    page,
    store.processing.pagination.perPage,
  )
}

const handleOrderCancelled = async (orderId: string) => {
  await store.getProcessingOrders()
}

onMounted(async () => {
  await store.getProcessingOrders()
})
</script>

<template>
  <div>
    <div v-if="store.processing.isLoading" class="mt-4">
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
              v-for="item in store.processing.data"
              :key="item.order_id"
              :item="item"
              @order-cancelled="handleOrderCancelled"
            />
          </tbody>
        </table>
      </div>
      <div class="lg:hidden space-y-3">
        <CustomerOrdersOrderMobileCard v-for="item in store.processing.data" :key="item.order_id" :item="item" />
      </div>
      <div v-if="!store.processing.data.length" class="text-center py-8 obotoronika-muted-text text-sm">
        No processing orders found.
      </div>
    </div>
    <!-- Pagination -->
    <div class="flex justify-end px-3 py-3.5 mt-4">
      <UPagination
        v-model="store.processing.pagination.page"
        :page-count="store.processing.pagination.perPage"
        :total="store.processing.pagination.total"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>
