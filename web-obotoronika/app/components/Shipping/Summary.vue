<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { UButton, UFormGroup, UInput } from '#components'

const props = withDefaults(
  defineProps<{
    canProceed: boolean
    products: Product[]
  }>(),
  {
    canProceed: false,
    queryString: '',
    products: () => [],
  },
)

const { address } = useUserStore()
const router = useRouter()

const isLoading = ref(false)
const state = reactive({
  coupon: '',
  discount: 0,
})

const subtotal = computed(() =>
  props.products.reduce(
    (total, product) =>
      total + (product.offer_price || product.price) * (product.quantity || 0),
    0,
  ),
)

// Calculate the total after applying the coupon discount
const total = computed(() => {
  const discountAmount = (subtotal.value * state.discount) / 100
  return subtotal.value - discountAmount + 150
})

const handleProceed = async () => {
  try {
    isLoading.value = true
    const items = props.products.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.offer_price || item.price,
      variants: item.variants ?? [],
    }))

    const payload = {
      shippingAddress: address,
      items,
    }
    const { data }: any = await useFetch('/api/orders', {
      method: 'POST',
      body: payload,
    })
    const id = data.value?.data.order.order_id ?? undefined
    if (id) {
      router.push({
        path: '/checkout/payment-method',
        query: { orderID: id },
      })
    }
    else {
      throw Error('Something wen wrong.')
    }
  }
  catch (error) {
    alert(error)
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="summery">
    <div class="obotoronika-border-color border rounded-md p-4 sticky top-24 bg-white dark:bg-dark">
      <h2 class="font-medium mb-2 obotoronika-title">
        Order Summary
      </h2>
      <div>
        <div class="mb-4 sum">
          <UFormGroup label="Apply Coupon" name="coupon">
            <UInput
              v-model="state.coupon"
              size="lg"
              :ui="{ icon: { trailing: { pointer: '' } } }"
              type="text"
              placeholder="Enter coupon code"
            >
              <template #trailing>
                <UButton
                  v-show="true"
                  color="primary"
                  variant="solid"
                  label="Apply"
                  block
                  class="!m-0 !rounded-l-none"
                />
              </template>
            </UInput>
          </UFormGroup>
        </div>
        <ul>
          <li>
            <span>Subtotal ({{ products.length }} items)</span>
            <b>{{ subtotal }} BDT</b>
          </li>
          <li>
            <span>Shipping Fee</span>
            <b>150 BDT</b>
          </li>
          <li class="font-semibold obotoronika-title">
            <span>Total</span>
            <b>{{ total }} BDT</b>
          </li>
        </ul>
        <UButton
          block
          class="mt-8"
          :disabled="props.canProceed"
          :loading="isLoading"
          size="lg"
          @click="handleProceed"
        >
          Proceed to Payment
        </UButton>
      </div>
    </div>
  </div>
</template>

<style>
@import url("./index.css");
</style>
