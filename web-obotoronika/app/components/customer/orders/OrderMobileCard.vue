<script lang="ts" setup>
defineProps<{ item: any }>()
</script>

<template>
  <div class="border obotoronika-border-color rounded-lg p-4 bg-white dark:bg-dark">
    <div class="flex justify-between items-start mb-3">
      <div>
        <p class="text-xs obotoronika-muted-text">Order ID</p>
        <p class="text-sm font-mono font-medium obotoronika-text-color">{{ item.order_id }}</p>
      </div>
      <span
        :class="['text-xs font-medium px-2 py-1 rounded-full',
          item.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          item.status === 'cancelled' || item.status === 'canceled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
          item.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
          item.status === 'shipped' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300']"
      >{{ item.status }}</span>
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
</template>
