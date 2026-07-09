<script lang="ts" setup>
import {
  User,
  ShoppingCart,
  LayoutDashboard,
  MapPin,
  Package,
  Star,
  Heart,
  Settings,
  LogOut,
} from 'lucide-vue-next'

const auth = useAuthStore()
const { user } = storeToRefs(auth)

const isDashboardUser = computed(() => {
  const role = user.value?.user_metadata?.role
  return ['super_admin', 'admin', 'manager', 'seller'].includes(role)
})

const handleLogout = async () => {
  await useFetch('/api/auth/logout', { method: 'delete' })
  window.location.reload()
}
</script>

<template>
  <div class="space-y-6 mt-4 px-2">
    <nav class="space-y-2">
      <NuxtLink
        v-if="isDashboardUser"
        to="/dashboard/analytics"
        class="nav-item"
        active-class="nav-active"
      >
        <div class="icon-box">
          <LayoutDashboard :size="18" />
        </div>
        <span>Dashboard</span>
      </NuxtLink>

      <NuxtLink to="/cart" class="nav-item" active-class="nav-active">
        <div class="icon-box">
          <ShoppingCart :size="18" />
        </div>
        <span>Cart</span>
      </NuxtLink>

      <NuxtLink to="/user/profile" class="nav-item" active-class="nav-active">
        <div class="icon-box">
          <User :size="18" />
        </div>
        <span>Profile</span>
      </NuxtLink>

      <NuxtLink to="/user/addresses" class="nav-item" active-class="nav-active">
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

      <NuxtLink to="/user/wishlist" class="nav-item" active-class="nav-active">
        <div class="icon-box">
          <Heart :size="18" />
        </div>
        <span>Wishlist</span>
      </NuxtLink>

      <NuxtLink to="/user/settings" class="nav-item" active-class="nav-active">
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
  </div>
</template>

<style scoped>
.nav-item {
  @apply text-gray-700 dark:text-gray-200 font-medium py-2 px-3 rounded-xl text-sm flex items-center gap-3 transition-all duration-200 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 hover:shadow-sm;
}

.nav-active {
  @apply bg-primary/10 text-primary font-semibold;
}

.icon-box {
  @apply p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center;
  transition: background 0.2s ease;
}

.nav-item:hover .icon-box {
  @apply bg-primary/10;
}
</style>
