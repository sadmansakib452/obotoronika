<script lang="ts" setup>
import { User } from 'lucide-vue-next'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAuthStore } from '@/stores/auth'
import { UModal } from '#components'

const auth = useAuthStore()
const { user } = storeToRefs(auth)

const isOpen = ref(false)

const isDashboardUser = computed(() => {
  const role = user.value?.user_metadata?.role
  return ['super_admin', 'admin', 'manager', 'seller'].includes(role)
})

const handleLogout = async () => {
  await useFetch('/api/auth/logout', { method: 'delete' })
  window.location.reload()
}

const handleLoginSuccess = () => {
  // Close the login modal
  isOpen.value = false
  location.reload()
}
</script>

<template>
  <div class="flex gap-2">
    <div v-if="user?.user_metadata.name" class="">
      <Popover>
        <PopoverTrigger as-child>
          <button class="btn-3">
            <User :size="20" />
            <span class="hidden lg:inline">Account</span>
          </button>
        </PopoverTrigger>
        <PopoverContent class="w-60 z-[9999] px-2 py-2" :align="'end'">
          <ul class="user-menu">
            <li v-if="isDashboardUser">
              <NuxtLink to="/dashboard/analytics" class="!mt-1">
                <Icon name="mdi:view-dashboard-outline" class="size-4" />
                Dashboard
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/user/profile" class="!mt-1">
                <Icon name="tabler:user" class="size-4" />
                Profile
              </NuxtLink>
            </li>
            <li @click="handleLogout">
              <button class="!mb-1">
                <Icon name="ic:twotone-log-in" class="size-4" />
                Logout
              </button>
            </li>
          </ul>
        </PopoverContent>
      </Popover>
    </div>
    <button v-else class="btn-3" @click="isOpen = true">
      <User :size="20" />
      <span class="hidden lg:inline">Account</span>
    </button>
  </div>
  <UModal v-model="isOpen" :ui="{ width: 'w-full sm:max-w-lg', container: 'items-center' }">
    <Auth @login-success="handleLoginSuccess" />
  </UModal>
</template>

<style>
@import url("./css/user-menu.css");
</style>
