<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { useProductsStore } from '@/stores/products'
// @ts-ignore
import { useSupabaseUser } from '#imports'
import { usePendingActionAfterLogin } from '@/composables/usePendingActionAfterLogin'
import { useLoginModal } from '@/composables/useLoginModal'

const props = defineProps<{
  product: Product
}>()

const store = useProductsStore()
const user = useSupabaseUser()
const { open: openLoginModal } = useLoginModal()
const { setPendingAction, runningProductId } = usePendingActionAfterLogin()

// Check if the product is in the wishlist
const isInWishlist = computed(() =>
  store.wishlist.some((item: any) => item.product_id === props.product.id),
)

// Reactive state for loading spinner
const isLoading = ref(false)

// Check if this product is being processed by pending action after login
const isPendingActionRunning = computed(() => runningProductId.value === props.product.id)

// Combined loading state
const isButtonLoading = computed(() => isLoading.value || isPendingActionRunning.value)

const config = useRuntimeConfig()

// Toggle wishlist status
const toggleWishlist = async () => {
  if (isLoading.value) return

  if (!user?.value) {
    const toast = useToast()
    toast.add({ title: 'Wishlist', description: 'Please login to add items to your wishlist.', color: 'yellow' })
    return
  }

  isLoading.value = true
  try {
    if (isInWishlist.value) {
      await store.removeWishlist(props.product)
    }
    else {
      await store.addWishlist(props.product)
    }
    await store.fetchWishlist()
  }
  catch (error) {
    console.error('Error toggling wishlist:', error)
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="product">
    <NuxtLink :to="`/products/${props.product.slug}`" @click="console.log('[PRODUCT-CARD] NuxtLink clicked — navigating to:', props.product.slug)">
      <div class="img">
        <img
          :src="`${config.public.mediaUrl}${props.product.thumbnail}`"
          :alt="props.product.title"
          loading="lazy"
        >
      </div>
      <div class="meta dark:bg-dark">
        <h1 class="font-Homenaje font-semibold obotoronika-title mt-2 truncate tracking-wider text-xl">
          {{ props.product.title }}
        </h1>
        <p v-if="props.product.short_description" class="text-xs my-1 text-gray-500">{{ props.product.short_description }}</p>
        <div class="flex items-center font-semibold obotoronika-text-color text-sm md:text-base">
          Tk {{ props.product.offer_price?.toFixed(2) || props.product.price.toFixed(2) }} BDT
          <del
            v-if="props.product.offer_price"
            class="ps-1.5 text-[13px] font-normal text-gray-500"
          >
            Tk {{ props.product.price.toFixed(2) }} BDT
          </del>
        </div>
      </div>
    </NuxtLink>
    <button class="wishlist-button" :disabled="isButtonLoading" @click="toggleWishlist">
      <template v-if="isButtonLoading">
        <!-- Loading Spinner -->
        <svg
          class="animate-spin h-5 w-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </template>
      <template v-else>
        <!-- Wishlist Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="none"
          :class="{ 'wishlist-active': isInWishlist }"
        >
          <path
            fill="#000"
            fill-opacity="0.25"
            d="M26.492 10.7a6.065 6.065 0 0 0-1.383-1.931 6.457 6.457 0 0 0-2.042-1.295A6.686 6.686 0 0 0 20.577 7a6.697 6.697 0 0 0-3.383.91 6.345 6.345 0 0 0-.693.469 6.345 6.345 0 0 0-.693-.47A6.697 6.697 0 0 0 12.425 7c-.863 0-1.7.159-2.49.474a6.442 6.442 0 0 0-2.041 1.294A6.028 6.028 0 0 0 6.51 10.7 5.776 5.776 0 0 0 6 13.078c0 .777.165 1.586.493 2.41a10.65 10.65 0 0 0 1.172 2.123c.797 1.14 1.894 2.33 3.255 3.537 2.256 2 4.49 3.38 4.585 3.437l.576.354a.809.809 0 0 0 .838 0l.576-.354a36.744 36.744 0 0 0 4.585-3.437c1.361-1.206 2.458-2.396 3.255-3.537.503-.721.9-1.435 1.171-2.123.329-.824.494-1.633.494-2.41a5.736 5.736 0 0 0-.508-2.378Z"
          />
          <path
            fill="#000"
            fill-opacity="0.25"
            stroke="#fff"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11.25 7C8.35 7 6 9.244 6 12.012c0 2.234.919 7.538 9.962 12.9a1.063 1.063 0 0 0 1.076 0C26.08 19.55 27 14.246 27 12.011 27 9.244 24.649 7 21.75 7c-2.9 0-5.25 3.037-5.25 3.037S14.149 7 11.25 7Z"
          />
        </svg>
      </template>
    </button>
  </div>
</template>

<style scoped>
.wishlist-button {
  @apply w-8 h-8 flex items-center justify-center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.wishlist-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.wishlist-active path {
  fill: red !important; /* Change the heart color when active */
}
</style>
