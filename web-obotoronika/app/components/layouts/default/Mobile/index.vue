<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
// @ts-ignore
import { X, User, ShoppingCart, Sun, Moon } from 'lucide-vue-next'
// @ts-ignore
import { onBeforeRouteUpdate } from '#app'
import { UModal } from '#components'

const colorMode = useColorMode()
const isMenuOpen = ref(false)

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const productsStore = useProductsStore()
const { totalCartItems } = storeToRefs(productsStore)

const isOpen = ref(false)
const isOpenLogin = ref(false)

const handleLoginSuccess = () => {
  isOpen.value = false
  location.reload()
}

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

onBeforeRouteUpdate(() => {
  isMenuOpen.value = false
})
</script>

<template>
  <div class="lg:hidden">
    <div class="flex items-center gap-2 lg:hidden">
      <LayoutsDefaultSearch />
      <NuxtLink to="/cart" class="relative p-1">
        <ShoppingCart :size="20" />
        <span v-if="totalCartItems" class="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-[#FC6A03] text-white rounded-full flex items-center justify-center">
          {{ totalCartItems > 9 ? '9+' : totalCartItems }}
        </span>
      </NuxtLink>
      <button class="p-1" @click="toggleTheme">
        <Sun v-if="colorMode.value === 'dark'" :size="20" />
        <Moon v-else :size="20" />
      </button>
      <button v-if="user?.user_metadata.name" @click="isMenuOpen = true" class="p-1">
        <User :size="20" />
      </button>
      <button v-else @click="isOpenLogin=true" class="p-1">
        <User :size="20" />
      </button>
    </div>
    <transition
      name="menu"
      enter-active-class="transition transform duration-300"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition transform duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isMenuOpen"
        class="w-screen h-screen bg-white dark:bg-gray-950 fixed top-0 left-0 z-50"
      >
        <div
          class="flex gap-2 items-center bg-primary text-white p-3 obotoronika-text-color justify-between"
        >
          <b class="font-medium text-white">My Account</b>
          <button class="text-white" @click="isMenuOpen = false">
            <X :size="20" />
          </button>
        </div>
        <LayoutsDefaultMobileMenu />
      </div>
    </transition>
    <UModal v-model="isOpenLogin" :ui="{ width: 'w-full sm:max-w-lg', container: 'items-center' }">
      <Auth @login-success="handleLoginSuccess" />
    </UModal>
  </div>
</template>
