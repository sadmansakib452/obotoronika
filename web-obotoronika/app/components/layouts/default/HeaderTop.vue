<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { Heart, ShoppingCart } from 'lucide-vue-next'
import { colors } from '@/constants/index'
// @ts-ignore
import { useSupabaseUser } from '#imports'

const { isSticky } = useIsSticky()
const store = useProductsStore()
const user = useSupabaseUser()

async function refreshHeaderCounts() {
  if (!user.value) {
    store.totalCartItems = 0
    store.totalWishlistItems = 0
    return
  }
  await store.fetchCartCount()
  await store.fetchWishlistCount()
}

// watch with immediate already runs on mount — no need for separate onMounted
watch(user, () => {
  refreshHeaderCounts()
}, { immediate: true })
</script>

<template>
  <div :class="['header-top', { 'is-sticky': isSticky }]">
    <LayoutsDefaultMenu />
    <NuxtLink to="/">
      <AtomsLogo
        :width="100"
        :height="80"
        :fill="colors.primary"
        class="-my-6 hidden lg:block"
      />
      <AtomsLogo
        :width="80"
        :height="60"
        :fill="colors.primary"
        class="-my-6 block lg:hidden mx-auto"
      />
    </NuxtLink>
    <div class="hidden lg:flex gap-4">
      <LayoutsDefaultSearch />
      <NuxtLink to="/cart" class="btn-3">
        <ShoppingCart :size="20" />
        <span v-if="store.totalCartItems" class="badge">
          {{ store.totalCartItems > 9 ? "9+" : `0${store.totalCartItems}` }}
        </span>
        <span>Cart</span>
      </NuxtLink>
      <NuxtLink to="/user/wishlist" class="btn-3">
        <span v-if="store.totalWishlistItems" class="badge2">
          {{
            store.totalWishlistItems > 9 ? "9+" : `0${store.totalWishlistItems}`
          }}
        </span>
        <Heart :size="20" />
        <span>Wishlist</span>
      </NuxtLink>
      <LayoutsDefaultUserMenu />
    </div>
    <LayoutsDefaultMobile />
  </div>
</template>
