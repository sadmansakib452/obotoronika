<script lang="ts" setup>
import {
  User,
  MapPin,
  Package,
  Star,
  Heart,
  Settings,
  LogOut,
} from 'lucide-vue-next'
import { colors } from '@/constants/index'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.signOut()
  await router.push('/')
}
</script>

<template>
  <div
    class="hidden pb-6 flex-col bg-white/80 border-r border-gray-200 backdrop-blur-md relative lg:flex lg:w-3/12 2xl:w-2/12 dark:bg-dark dark:border-theme-border"
  >
    <div
      class="sticky max-h-screen w-full h-full px-4 left-0 top-0 flex flex-col"
    >
      <!-- Logo -->
      <div class="flex justify-center">
        <NuxtLink to="/">
          <AtomsLogo :width="80" :height="70" :fill="colors.primary" />
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="space-y-2">
        <NuxtLink to="/user/profile" class="nav-item" active-class="nav-active">
          <div class="icon-box">
            <User :size="18" />
          </div>
          <span>Profile</span>
        </NuxtLink>
        <NuxtLink
          to="/user/addresses"
          class="nav-item"
          active-class="nav-active"
        >
          <div class="icon-box">
            <MapPin :size="18" />
          </div>
          <span>Addresses</span>
        </NuxtLink>
        <NuxtLink to="/user/orders" class="nav-item" active-class="nav-active">
          <div class="icon-box">
            <Package :size="18" />
          </div>
          <span>Orders</span>
        </NuxtLink>
        <NuxtLink to="/user/reviews" class="nav-item" active-class="nav-active">
          <div class="icon-box">
            <Star :size="18" />
          </div>
          <span>Reviews</span>
        </NuxtLink>
        <NuxtLink
          to="/user/wishlist"
          class="nav-item"
          active-class="nav-active"
        >
          <div class="icon-box">
            <Heart :size="18" />
          </div>
          <span>Wishlist</span>
        </NuxtLink>
        <NuxtLink
          to="/user/settings"
          class="nav-item"
          active-class="nav-active"
        >
          <div class="icon-box">
            <Settings :size="18" />
          </div>
          <span>Settings</span>
        </NuxtLink>
        <li class="nav-item cursor-pointer" @click="handleLogout">
          <div class="icon-box">
            <LogOut :size="18" />
          </div>
          <span>Logout</span>
        </li>
      </nav>

      <!-- Footer -->
      <!-- <div
        class="mt-auto border-t pt-4 text-xs text-gray-400 text-center tracking-wide"
      >
        © 2025 Obotoronika
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.nav-item {
  @apply text-gray-700 font-medium py-2 px-3 rounded-xl text-sm flex items-center gap-3 transition-all duration-200 hover:bg-gray-100/70 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-800;
}

.nav-active {
  @apply bg-primary/10 text-primary font-semibold;
}

.icon-box {
  @apply p-2 bg-gray-100 rounded-lg shadow-sm flex items-center justify-center dark:bg-gray-800;
  transition: background 0.2s ease;
}

.nav-item:hover .icon-box {
  @apply bg-primary/10;
}
</style>
