<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { UButton } from '#components'

const store = useProductsStore()
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    await store.fetchCart()
  }
  finally {
    loading.value = false
  }
})

const isEmpty = computed(
  () => !loading.value && store.cart.length === 0 && store.unavailableCart.length === 0,
)
</script>

<template>
  <div class="w-11/12 lg:w-2/3 mx-auto my-20 flex flex-col lg:grid lg:grid-cols-12 gap-8">
    <template v-if="loading">
      <div class="col-span-12 flex flex-col items-center justify-center py-16 text-center">
        <p class="obotoronika-muted-text text-sm">
          Loading cart...
        </p>
      </div>
    </template>
    <template v-else-if="isEmpty">
      <div class="col-span-12 flex flex-col items-center justify-center py-16 text-center">
        <p class="text-lg font-medium obotoronika-title">
          Your cart is empty
        </p>
        <p class="obotoronika-muted-text text-sm mt-1 mb-4">
          Add items from the store to get started
        </p>
        <NuxtLink to="/">
          <UButton color="primary" label="Continue shopping" />
        </NuxtLink>
      </div>
    </template>
    <template v-else>
      <CartProducts :products="store.cart" :unavailable="store.unavailableCart" />
      <CartSummary />
    </template>
  </div>
</template>
