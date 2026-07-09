<script lang="ts" setup>
import { Menu, X } from 'lucide-vue-next'

const uiStore = useUiStore()

useCustomBodyScrollLock(toRef(uiStore, 'sidebarOpen'))
</script>

<template>
  <div>
    <button class="btn-3" @click="uiStore.toggleSidebar()">
      <Menu v-if="!uiStore.sidebarOpen" :size="20" />
      <X v-else :size="20" />
    </button>

    <!-- Mobile overlay sidebar -->
    <Teleport to="body">
      <Transition name="mobile-sidebar">
        <div v-if="uiStore.sidebarOpen" class="mobile-main-sidebar">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 h-16">
            <AtomsLogo :width="100" :height="40" fill="#FC6A03" />
            <button class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" @click="uiStore.closeSidebar()">
              <X :size="20" />
            </button>
          </div>
          <div class="flex-1">
            <LayoutsDefaultSidebar />
          </div>
        </div>
      </Transition>
      <div
        v-if="uiStore.sidebarOpen"
        class="fixed inset-0 bg-black/50 z-40"
        @click="uiStore.closeSidebar()"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.mobile-main-sidebar {
  @apply fixed top-0 left-0 z-50 w-72 h-full flex flex-col bg-white dark:bg-[#14141f] shadow-xl;
}

.mobile-sidebar-enter-active {
  transition: transform 0.3s ease;
}
.mobile-sidebar-leave-active {
  transition: transform 0.25s ease;
}
.mobile-sidebar-enter-from,
.mobile-sidebar-leave-to {
  transform: translateX(-100%);
}
</style>
