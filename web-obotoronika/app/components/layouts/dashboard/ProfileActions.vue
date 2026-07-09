<script setup lang="ts">
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.signOut()
  await router.push('/')
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <button class="w-10 h-10 active:translate-y-px text-xl flex justify-center items-center obotoronika-text-color">
        <Icon name="iconamoon:arrow-down-2-duotone" />
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-60 z-[9999] p-0 py-2" :align="'end'" :side-offset="4">
      <ul>
        <li>
          <NuxtLink to="/dashboard/profile">
            <Icon name="tabler:user" class="size-5" />
            Profile
          </NuxtLink>
        </li>
        <li @click="handleLogout()">
          <button>
            <Icon name="ic:twotone-log-in" class="size-5" />
            Logout
          </button>
        </li>
      </ul>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
li {
    @apply p-2 font-poppins font-medium hover:bg-gray-100 cursor-pointer obotoronika-text-color dark:hover:bg-theme-border;

    a,
    button {
        @apply flex gap-2 items-center;
    }
}
</style>
