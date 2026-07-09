<script setup lang="ts">
// @ts-ignore
import { useSupabaseUser } from '#imports'
import { useProductsStore } from '@/stores/products'
import { usePendingActionAfterLogin } from '@/composables/usePendingActionAfterLogin'
import { useLoginModal } from '@/composables/useLoginModal'
import { UButton, UPagination } from '#components'

const store = useProductsStore()
const config = useRuntimeConfig()
const user = useSupabaseUser()
const { open: openLoginModal } = useLoginModal()
const { setPendingAction } = usePendingActionAfterLogin()
const toast = useToast()

// Per-item loading: which product id is currently removing or adding to cart
const removingId = ref<string | null>(null)
const addingToCartId = ref<string | null>(null)

// Load the initial page on mount
onMounted(async () => {
  await store.fetchProductWishlist(store.productsWishlist.meta.page)
})

// Handle page change
const changePage = async (page: number) => {
  await store.fetchProductWishlist(page)
}

const handleRemove = async (item: Product) => {
  if (removingId.value) return
  removingId.value = item.id
  try {
    await store.removeWishlist(item as unknown as Product)
    toast.add({ title: 'Removed from wishlist', color: 'green' })
  }
  catch {
    toast.add({ title: 'Failed to remove', color: 'red' })
  }
  finally {
    removingId.value = null
  }
}

const handleAddToCart = async (item: Product) => {
  if (!user?.value) {
    setPendingAction({ type: 'cart', productId: item.id, quantity: 1, variants: [] })
    openLoginModal()
    return
  }
  if (addingToCartId.value) return
  addingToCartId.value = item.id
  try {
    store.variants = []
    await store.addToCart(item.id, 1)
    toast.add({ title: 'Added to cart', color: 'green' })
  }
  catch (error) {
    console.error('Error adding to cart:', error)
    toast.add({ title: 'Failed to add to cart', color: 'red' })
  }
  finally {
    addingToCartId.value = null
  }
}

useHead({
  title: 'My Wishlist | Obotoronika',
})
</script>

<template>
  <div>
    <div v-if="store.productsWishlist.products.length" class="space-y-4 mt-8">
      <div
        v-for="(item) in store.productsWishlist.products"
        :key="item.id"
        class="flex items-center gap-4 bg-white p-4 rounded-xl shadow justify-between dark:bg-dark"
      >
        <NuxtLink
          class="flex items-center gap-4"
          :to="`/products/${item.slug}`"
        >
          <img
            :src="`${config.public.mediaUrl}${item.thumbnail}`"
            alt="Product Image"
            class="w-20 h-20 object-cover rounded-md"
          >
          <div class="flex-1">
            <h3 class="obotoronika-title font-medium">{{ item.title }}</h3>
            <p class="text-gray-500 text-sm">Tk {{ item.price?.toFixed(2) }} BDT</p>
          </div>
        </NuxtLink>
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-trash"
            size="sm"
            color="red"
            square
            variant="outline"
            :loading="removingId === item.id"
            :disabled="!!removingId || !!addingToCartId"
            @click="handleRemove(item as unknown as Product)"
          />
          <UButton
            :icon="addingToCartId === item.id ? undefined : 'tdesign:cart-add'"
            size="sm"
            color="primary"
            square
            variant="outline"
            :loading="addingToCartId === item.id"
            :disabled="!!removingId || !!addingToCartId"
            @click="handleAddToCart(item as unknown as Product)"
          />
        </div>
      </div>
    </div>
    <div v-else class="text-gray-500 mt-4 text-sm">
      Your wishlist is empty.
    </div>

    <!-- Pagination -->
    <div v-if="store.productsWishlist.products.length" class="flex justify-end px-3 py-3.5">
      <UPagination
        v-model="store.productsWishlist.meta.page"
        :page-count="store.productsWishlist.meta.perPage"
        :total="store.productsWishlist.meta.total"
        @update:model-value="changePage"
      />
    </div>
  </div>
</template>
