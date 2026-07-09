<script lang="ts" setup>
import { BadgeCheck, Clock, Package } from 'lucide-vue-next'
import { UButton } from '#components'

definePageMeta({
  roles: ['customer', 'super_admin'],
})

const store = useOrderStore()
</script>

<template>
  <div class="my-8 w-11/12 mx-auto lg:w-10/12 lg:ml-4">
    <div class="flex justify-between">
      <div>
        <h3 class="font-Homenaje text-3xl obotoronika-title">
          My Orders
        </h3>
        <p class="obotoronika-muted-text text-sm">
          View your recent purchases, check order status, and see what's on the
          way.
        </p>
      </div>

      <UButton
        label="Continue Shopping"
        size="lg"
        class="h-fit"
        color="green"
        to="/"
      />
    </div>
    <div class="grid grid-cols-1 gap-8 mt-6 md:grid-cols-2 xl:grid-cols-3">
      <div class="border obotoronika-border-color rounded-md p-4">
        <div
          class="obotoronika-muted-text text-sm flex justify-between items-center font-medium"
        >
          <p>Total Orders</p>
          <Package :size="16" />
        </div>
        <p class="font-semibold obotoronika-title text-xl my-2">
          {{ store.orders.counts.all }}
        </p>
        <p class="obotoronika-muted-text text-sm">
          Across all statuses
        </p>
      </div>
      <div class="border obotoronika-border-color rounded-md p-4">
        <div
          class="obotoronika-muted-text text-sm flex justify-between items-center font-medium"
        >
          <p>Pending & Processing</p>
          <Clock :size="16" />
        </div>
        <p class="font-semibold obotoronika-title text-xl my-2">
          {{ store.orders.counts.processing }}
        </p>
        <p class="obotoronika-muted-text text-sm">
          Orders awaiting action
        </p>
      </div>
      <div class="border obotoronika-border-color rounded-md p-4">
        <div
          class="obotoronika-muted-text text-sm flex justify-between items-center font-medium"
        >
          <p>Delivered Orders</p>
          <BadgeCheck :size="16" />
        </div>
        <p class="font-semibold obotoronika-title text-xl my-2">
          {{ store.orders.counts.delivered }}
        </p>
        <p class="obotoronika-muted-text text-sm">
          Successfully completed orders
        </p>
      </div>
    </div>
    <CustomerOrders />
  </div>
</template>
