<script setup lang="ts">
import { UButton } from '#components'

useHead({
  title: 'Payment Failed | Obotoronika',
})
</script>

<template>
  <div class="w-11/12 max-w-2xl mx-auto my-10 border obotoronika-border-color rounded-md p-6 dark:bg-dark">
    <h1 class="text-lg font-semibold obotoronika-title">
      Payment failed
    </h1>
    <p class="text-sm obotoronika-muted-text mt-2">
      Your payment could not be completed. You can try again from your order or return home.
    </p>
    <div class="flex gap-3 mt-6">
      <UButton to="/" color="primary">
        Go home
      </UButton>
      <UButton to="/cart" variant="outline">
        Back to cart
      </UButton>
    </div>
  </div>
</template>
