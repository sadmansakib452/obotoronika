<script lang="ts" setup>
import Notification from './Notification.vue'
import ProfileActions from './ProfileActions.vue'
import ActionButton from '@/components/atoms/ActionButton.vue'
import { useAuthStore } from '@/stores/auth'

const colorMode = useColorMode()

const auth = useAuthStore()
const { user, userRole } = storeToRefs(auth)

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})
</script>

<template>
  <div class="right-menu">
    <ClientOnly>
      <ActionButton :icon="isDark ? 'ion:moon-sharp' : 'mingcute:sun-fill'" @click="isDark = !isDark" />
    </ClientOnly>
    <Notification />
    <div class="flex gap-2 justify-center items-center">
      <div class="flex lg:gap-2 justify-center items-center">
        <div class="profile-photo">
          <UiAvatar class="!w-[34px] !h-[34px]">
            <UiAvatarImage :src="user?.user_metadata?.avatar_url" />
            <UiAvatarFallback>
              {{ user?.user_metadata.name.split(' ')[0].charAt(0) }}{{ user?.user_metadata?.name?.split(' ')?.[1]?.charAt(0) }}
            </UiAvatarFallback>
          </UiAvatar>
        </div>
        <div class="profile-name hidden lg:flex flex-col">
          <span class="font-semibold capitalize obotoronika-text-color">{{ user?.user_metadata.name.split(' ')[0] }}</span>
          <span class="text-xs capitalize obotoronika-text-color">{{ userRole && userRole.split('_').join(' ') }}</span>
        </div>
        <ProfileActions />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.right-menu {
    @apply ms-auto flex shrink-0 justify-end items-center gap-2 xs:gap-3 xl:gap-4;
}
</style>
