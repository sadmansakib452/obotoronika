<script lang="ts" setup>
import { useOrderStore } from '@/stores/orders'

import { UPagination } from '#components'

const store = useOrderStore()

const handlePageChange = (page: number) => {
  store.setPagination(
    page,
    store.orders.pagination.perPage,
  )
}

const handleOrderCancelled = async (orderId: string) => {
  await store.getOrders()
  await store.getOrdersCount()
}

const handleRefundRequested = async (orderId: string) => {
  console.log('Refund requested for order:', orderId)
}

onMounted(async () => {
  await store.getOrders()
  await store.getOrdersCount()
})
</script>

<template>
  <div>
    <div v-if="store.orders.isLoading" class="mt-4">
      loading
    </div>
    <div v-else class="mt-4">
      <!-- Desktop table -->
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
            v-for="item in store.orders.data"
            :key="item.order_id"
            :item="item"
            @order-cancelled="handleOrderCancelled"
            @refund-requested="handleRefundRequested"
          />
        </tbody>
        </table>
      </div>
      <!-- Mobile cards -->
      <div class="lg:hidden space-y-3">
        <div
          v-for="item in store.orders.data"
          :key="item.order_id"
          class="border obotoronika-border-color rounded-lg p-4 bg-white dark:bg-dark"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-xs obotoronika-muted-text">Order ID</p>
              <p class="text-sm font-mono font-medium obotoronika-text-color">{{ item.order_id }}</p>
            </div>
            <span :class="['text-xs font-medium px-2 py-1 rounded-full', item.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : item.status === 'cancelled' || item.status === 'canceled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400']">{{ item.status }}</span>
          </div>
          <div class="flex items-center gap-3 mb-3">
            <img v-if="item.first_product?.thumbnail" :src="item.first_product.thumbnail" class="w-12 h-12 rounded-md object-cover" />
            <div>
              <p class="text-sm font-medium obotoronika-text-color">{{ item.first_product?.title }}</p>
              <p class="text-xs obotoronika-muted-text">Qty: {{ item.first_product?.quantity }} {{ item.more_products_count ? `+${item.more_products_count} more` : '' }}</p>
            </div>
          </div>
          <div class="flex justify-between items-center text-sm">
            <div>
              <p class="text-xs obotoronika-muted-text">Total</p>
              <p class="font-semibold obotoronika-title">Tk {{ item.total_amount?.toFixed(2) }}</p>
            </div>
            <p class="text-xs obotoronika-muted-text capitalize">{{ item.payment_method }}</p>
          </div>
        </div>
      </div>
      <div v-if="!store.orders.data.length" class="text-center py-8 obotoronika-muted-text text-sm">
        No orders found.
      </div>
    </div>
    <!-- Pagination -->
    <div class="flex justify-end px-3 py-3.5 mt-4">
      <UPagination
        v-model="store.orders.pagination.page"
        :page-count="store.orders.pagination.perPage"
        :total="store.orders.pagination.total"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>
