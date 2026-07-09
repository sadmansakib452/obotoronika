<script setup lang="ts">
import { X } from 'lucide-vue-next'
import menu from '@/data/menu'
import SidebarMenu from './SidebarMenu.vue'

const isOpen = ref(false)
const route = useRoute()

watch(() => route.fullPath, () => {
  isOpen.value = false
})
</script>

<template>
  <button
    class="w-10 h-10 active:translate-y-px text-xl flex justify-center items-center me-3 p-0 sm:me-4 xl:hidden"
    @click="isOpen = !isOpen"
  >
    <X v-if="isOpen" :size="20" />
    <Icon v-else name="heroicons-outline:menu-alt-3" />
  </button>

  <!-- Mobile overlay sidebar -->
  <Teleport to="body">
    <Transition name="dash-sidebar">
      <div v-if="isOpen" class="mobile-dash-sidebar">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 h-16">
          <span class="text-lg font-bold text-[#FC6A03]">Obotoronika</span>
          <button class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" @click="isOpen = false">
            <X :size="20" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto">
          <SidebarMenu :menu="menu" />
        </div>
      </div>
    </Transition>
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-40"
      @click="isOpen = false"
    />
  </Teleport>
</template>

<style scoped>
.mobile-dash-sidebar {
  @apply fixed top-0 left-0 z-50 w-72 h-full flex flex-col bg-white dark:bg-[#14141f] shadow-xl;
}

.dash-sidebar-enter-active {
  transition: transform 0.3s ease;
}
.dash-sidebar-leave-active {
  transition: transform 0.25s ease;
}
.dash-sidebar-enter-from,
.dash-sidebar-leave-to {
  transform: translateX(-100%);
}
</style>
