<script setup lang="ts">
import { UButton } from '#components'

useHead({
  title: 'Payment Cancelled | Obotoronika',
})
</script>

<template>
  <div class="w-11/12 max-w-2xl mx-auto my-10 border obotoronika-border-color rounded-md p-6 dark:bg-dark">
    <h1 class="text-lg font-semibold obotoronika-title">
      Payment cancelled
    </h1>
    <p class="text-sm obotoronika-muted-text mt-2">
      You cancelled the payment process. You can return to your cart and try again.
    </p>
    <div class="flex gap-3 mt-6">
      <UButton to="/cart" color="primary">
        Back to cart
      </UButton>
      <UButton to="/" variant="outline">
        Go home
      </UButton>
    </div>
  </div>
</template>
