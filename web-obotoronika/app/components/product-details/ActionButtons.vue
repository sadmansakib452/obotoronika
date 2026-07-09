<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { Minus, Plus } from 'lucide-vue-next'
// @ts-ignore
import { useSupabaseUser } from '#imports'
import { usePendingActionAfterLogin } from '@/composables/usePendingActionAfterLogin'
import { UModal } from '#components'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  merchantId: {
    type: String,
    required: true,
  },
  product: {
    type: Object as () => Product | undefined,
    default: undefined,
  },
})

const user = useSupabaseUser()
const { setPendingAction, runningProductId } = usePendingActionAfterLogin()

const isOpenLoginModal = ref(false)
const pendingLoginAction = ref<'buy' | null>(null) // 'buy' = redirect to checkout after login
const isLoading = ref(false)

// Check if this product is being processed by pending action after login
const isPendingActionRunning = computed(() => runningProductId.value === props.id)

// Combined loading state for add to cart / wishlist
const isButtonLoading = computed(() => isLoading.value || isPendingActionRunning.value)
const quantity = ref(1)
const router = useRouter()
const store = useProductsStore()

const handleAddToCart = async () => {
  if (!user?.value) {
    pendingLoginAction.value = null
    setPendingAction({ type: 'cart', productId: props.id, quantity: quantity.value, variants: store.variants })
    isOpenLoginModal.value = true
    return
  }
  try {
    isLoading.value = true
    await store.addToCart(props.id, quantity.value)
  }
  catch (error) {
    console.error('Error adding to cart:', error)
  }
  finally {
    isLoading.value = false
  }
}

const handleUpdateQuantity = async () => {
  if (!user?.value) return
  try {
    isLoading.value = true
    await store.updateCartQuantity(props.id, quantity.value)
  }
  catch (error) {
    console.error('Error updating cart quantity:', error)
  }
  finally {
    isLoading.value = false
  }
}

const isBuyNowLoading = ref(false)

const handleBuyItNow = async () => {
  if (user?.value) {
    isBuyNowLoading.value = true
    try {
      const products = [
        { productID: props.id, quantity: quantity.value, variants: store.variants, merchant_id: props.merchantId },
      ]
      const query = products
        .map((item, index) =>
          `items[${index}][id]=${item.productID}`
          + `&items[${index}][quantity]=${item.quantity}`
          + `&items[${index}][variants]=${encodeURIComponent(JSON.stringify(item.variants))}`
          + `&items[${index}][merchant_id]=${item.merchant_id}`,
        )
        .join('&')

      await router.push({
        path: '/shipping',
        query: { products: query },
      })
    }
    finally {
      isBuyNowLoading.value = false
    }
  }
  else {
    pendingLoginAction.value = 'buy'
    isOpenLoginModal.value = true
  }
}

const handleAddToWishlist = async () => {
  if (!user?.value) {
    pendingLoginAction.value = null
    setPendingAction({ type: 'wishlist', productId: props.product?.id ?? props.id })
    isOpenLoginModal.value = true
    return
  }
  if (!props.product) return
  try {
    isLoading.value = true
    await store.addWishlist(props.product)
    await store.fetchWishlist()
  }
  catch (error) {
    console.error('Error adding to wishlist:', error)
  }
  finally {
    isLoading.value = false
  }
}

const handleLoginSuccess = () => {
  isOpenLoginModal.value = false
  if (pendingLoginAction.value === 'buy') {
    pendingLoginAction.value = null
    router.push({
      path: '/checkout',
      query: { productID: props.id, quantity: quantity.value },
    }).then(() => {
      location.reload()
    })
  }
  else {
    pendingLoginAction.value = null
    location.reload()
  }
}
</script>

<template>
  <div>
    <div class="buttons">
      <div
        class="btn-2 flex justify-between border py-0 obotoronika-text-color h-12 px-3"
      >
        <button
          :disabled="quantity <= 1 || isButtonLoading"
          class="w-5 h-full flex justify-center items-center md:w-10"
          @click="quantity--"
        >
          <Minus :size="20" />
        </button>

        <!-- Editable Quantity Input -->
        <input
          v-model="quantity"
          type="number"
          class="min-w-[2rem] text-center border-none outline-none"
          @change="handleUpdateQuantity"
        >

        <button
          class="w-5 h-full flex justify-center items-center md:w-10"
          :disabled="isButtonLoading"
          @click="quantity++"
        >
          <Plus :size="20" />
        </button>
      </div>
      <button
        class="btn-2 flex gap-2 disabled:cursor-not-allowed"
        :disabled="isButtonLoading || !product"
        @click="handleAddToWishlist"
      >
        <AtomsIcon v-if="!isButtonLoading" name="tdesign:heart" class="text-xl" />
        <AtomsIcon v-else name="eos-icons:loading" class="text-xl" />
        Add to Wishlist
      </button>
    </div>
    <div class="buttons">
      <button
        class="btn-2 flex gap-2 disabled:cursor-not-allowed"
        :disabled="isButtonLoading"
        @click="handleAddToCart"
      >
        <AtomsIcon v-if="!isButtonLoading" name="tdesign:cart-add" class="text-xl" />
        <AtomsIcon v-else name="eos-icons:loading" class="text-xl" />
        Add to Cart
      </button>
      <button
        class="btn-1 disabled:cursor-not-allowed"
        :disabled="isBuyNowLoading"
        @click="handleBuyItNow"
      >
        <AtomsIcon v-if="!isBuyNowLoading" name="tdesign:cart" class="text-xl" />
        <AtomsIcon v-else name="eos-icons:loading" class="text-xl" />
        Buy it now
      </button>
    </div>

    <!-- Login Modal -->
    <UModal v-model="isOpenLoginModal" :ui="{ width: 'w-full sm:max-w-lg', container: 'items-center' }">
      <Auth @login-success="handleLoginSuccess" />
    </UModal>
  </div>
</template>

<style scoped>
.buttons {
  @apply mt-3 grid grid-cols-2 gap-2 md:gap-4 w-full 2xl:w-2/3;
}

.buttons .btn-1 {
  @apply py-2.5 w-full m-0;
}

.buttons .btn-2 {
  @apply py-3 w-full m-0 !border;
}
</style>
