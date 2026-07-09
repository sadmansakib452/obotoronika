<template>
  <aside
    :class="cn(
      'sidebar ',
      asideClass,
    )
    "
  >
    <div class="logo">
      <NuxtLink to="/" class="text-primary" aria-label="Site Logo">
        <Logo
          :width="100"
          :height="50"
          class="-mb-2.5 -mt-4"
          :fill="colors.primary"
        />
      </NuxtLink>
    </div>
    <ScrollArea class="simple-sidebar">
      <SidebarMenu :menu="menu" />
    </ScrollArea>
  </aside>
</template>

<script lang="ts" setup>
import SidebarMenu from './SidebarMenu.vue'
import menu from '@/data/menu'
import Logo from '@/components/atoms/Logo.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { colors } from '@/constants/index'

const props = withDefaults(defineProps<{ class: string }>(), {
  class: '',
  // project: null,
})
const asideClass = computed(() => props.class)
</script>

<style lang="scss" scoped>
.sidebar {
  @apply fixed bottom-0 start-0 z-[999] h-full w-[270px] border-e bg-white dark:bg-gray-100/50 2xl:w-72 obotoronika-border-color;

  .logo {
    @apply fixed top-0 z-40 px-6 py-4 dark:bg-dark 2xl:px-8 2xl:pt-6 border-b w-[288px] obotoronika-border-color;
  }

  .simple-sidebar {
    @apply h-[calc(100%-54px)] dark:bg-dark mt-16;
  }
}
</style>
