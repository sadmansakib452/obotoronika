<script setup lang="ts">
import { UButton, UIcon } from '#components'

const route = useRoute()
const orderID = route.query.orderID || ''

useHead({
  title: 'Order Received | Obotoronika',
})
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center max-w-md mx-auto p-8">
      <div class="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
        <UIcon
          name="i-heroicons-check-circle"
          class="w-12 h-12 text-green-500"
        />
      </div>

      <h1 class="text-2xl font-bold obotoronika-title mb-2">
        Order Placed Successfully!
      </h1>

      <p class="text-gray-500 dark:text-gray-400 mb-1">
        Thank you for shopping with Obotoronika.
      </p>

      <p
        v-if="orderID"
        class="text-sm text-gray-400 dark:text-gray-500 mb-6"
      >
        Order ID:
        <span class="font-mono font-medium text-gray-700 dark:text-gray-300">{{ orderID }}</span>
      </p>

      <div class="flex gap-3 justify-center">
        <UButton
          to="/user/orders"
          color="primary"
          label="View My Orders"
          size="lg"
        />
        <UButton
          to="/"
          color="gray"
          variant="soft"
          label="Continue Shopping"
          size="lg"
        />
      </div>
    </div>
  </div>
</template>
