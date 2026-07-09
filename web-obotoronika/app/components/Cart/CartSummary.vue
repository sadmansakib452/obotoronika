<script lang="ts" setup>
import { computed } from 'vue'
import { buildNestedQueryValue } from '@@/shared/utils/queryParamUtils'

import { UButton } from '#components'

const router = useRouter()
const store = useProductsStore()

// Get the selected cart items from the store
const selectedCart = computed(() => store.selectedCart as CartItem[])

// Calculate the subtotal dynamically
const subtotal = computed(() =>
  selectedCart.value.reduce(
    (total, item) =>
      total + (item.product.offer_price || item.product.price) * item.quantity,
    0,
  ),
)

// Define a fixed shipping fee (can be dynamic if needed)
const shippingFee = computed(() => (selectedCart.value.length > 0 ? 150 : 0))

// Calculate the total dynamically
const total = computed(() => subtotal.value + shippingFee.value)

const handleCheckout = () => {
  try {
    const products = selectedCart.value.map(item => ({
      id: item.product_id,
      quantity: item.quantity,
      variants: JSON.stringify(item.variants),
      merchant_id: item.product.merchant_id,
    }))

    router.push({
      path: 'shipping',
      query: { products: buildNestedQueryValue(products) },
    })
  }
  catch {
    console.log()
  }
}
</script>

<template>
  <div class="summery">
    <div class="border rounded-md p-4 sticky top-24 bg-white shadow-md dark:bg-dark">
      <h2 class="font-medium mb-2 obotoronika-title">
        Order Summary
      </h2>
      <div>
        <ul>
          <li>
            <span>Subtotal ({{ selectedCart.length }} items)</span>
            <b>{{ subtotal.toFixed(2) }} BDT</b>
          </li>
          <li>
            <span>Shipping Fee</span>
            <b>{{ shippingFee.toFixed(2) }} BDT</b>
          </li>
          <li class="font-semibold obotoronika-title">
            <span>Total</span>
            <b>{{ total.toFixed(2) }} BDT</b>
          </li>
        </ul>
        <UButton
          block
          class="mt-8"
          :disabled="selectedCart.length === 0"
          @click="handleCheckout"
        >
          Proceed to Checkout
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summery {
  @apply lg:col-span-4;
}
.summery ul {
  @apply list-none;
}
.summery ul li {
  @apply flex justify-between mb-2;
}
.summery ul li b {
  @apply font-medium obotoronika-title;
}
</style>
