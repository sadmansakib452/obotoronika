<script setup lang="ts">
import { MoveRight, ChevronDown } from 'lucide-vue-next'

const store = useSettingsStore()
const { menu } = storeToRefs(store)
const uiStore = useUiStore()
const route = useRoute()

watch(() => route.fullPath, () => {
  uiStore.closeSidebar()
})

const hoveredIndex = ref<number | null>(null)
const expandedIndex = ref<number | null>(null)
const flyoutTop = ref(0)

const isDesktop = ref(false)

onMounted(() => {
  isDesktop.value = window.matchMedia('(min-width: 1024px)').matches
})

const flyoutChildren = computed(() => {
  if (hoveredIndex.value === null) return []
  return menu.value[hoveredIndex.value]?.children ?? []
})

function showFlyout(index: number, event: MouseEvent) {
  if (!isDesktop.value) return
  hoveredIndex.value = index
  const item = event.currentTarget as HTMLElement
  const nav = item.closest('.sidebar-menu') as HTMLElement
  if (nav) {
    flyoutTop.value = item.getBoundingClientRect().top - nav.getBoundingClientRect().top
  }
}

function hideFlyout() {
  hoveredIndex.value = null
}

function toggleExpand(index: number) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

function handleItemClick(item: any) {
  console.log('[SIDEBAR] handleItemClick — hasChildren:', !!item.children, 'expandedIndex:', expandedIndex.value)
  if (!item.children) return
  toggleExpand(menu.value.indexOf(item))
}
</script>

<template>
  <nav class="sidebar-menu" @mouseleave="hideFlyout">
    <div class="menu-primary">
      <ul>
        <li
          v-for="(item, index) in menu"
          :key="item.label"
          class="menu-item"
          :class="{ 'menu-item--active': hoveredIndex === index || expandedIndex === index }"
          @mouseenter="item.children ? showFlyout(index, $event) : null"
          @click="handleItemClick(item)"
        >
          <NuxtLink v-if="!item.children" :to="'/sections' + item.href" class="menu-link">
            {{ item.label }}
          </NuxtLink>
          <div v-else class="menu-link menu-link--parent">
            <span>{{ item.label }}</span>
            <MoveRight :size="14" class="menu-arrow hidden lg:block" />
            <ChevronDown
              :size="14"
              class="menu-arrow lg:hidden"
              :class="{ 'rotate-180': expandedIndex === index }"
            />
          </div>
          <!-- Mobile accordion children -->
          <div
            v-if="item.children && expandedIndex === index"
            class="accordion-children lg:hidden"
          >
            <ul>
              <li
                v-for="child in item.children"
                :key="child.label"
                class="menu-item menu-item--child"
              >
                <NuxtLink v-if="!child.children" :to="'/sections' + child.href" class="menu-link menu-link--child">
                  {{ child.label }}
                </NuxtLink>
                <span v-else class="menu-link menu-link--child">{{ child.label }}</span>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>

    <!-- Desktop hover flyout -->
    <Transition name="flyout">
      <div
        v-if="flyoutChildren.length"
        class="menu-flyout"
        :style="{ top: flyoutTop + 'px', maxHeight: 'calc(100% - ' + flyoutTop + 'px)' }"
      >
        <ul>
          <li v-for="child in flyoutChildren" :key="child.label" class="menu-item">
            <NuxtLink v-if="!child.children" :to="'/sections' + child.href" class="menu-link">
              {{ child.label }}
            </NuxtLink>
            <span v-else class="menu-link">{{ child.label }}</span>
          </li>
        </ul>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.sidebar-menu {
  @apply relative h-full;
}

.menu-primary {
  @apply relative overflow-y-auto h-full;
}

.menu-item {
  @apply border-b border-gray-100 dark:border-gray-800 last:border-b-0;
  transition: background-color 0.15s ease;
}

.menu-item:hover,
.menu-item--active {
  @apply bg-gray-50 dark:bg-gray-800/50;
}

.menu-item--child {
  @apply bg-gray-50/50 dark:bg-gray-800/30;
}

.menu-link {
  @apply flex items-center justify-between px-4 py-3 lg:px-6 text-sm text-gray-700 dark:text-gray-200 no-underline w-full;
}

.menu-link--parent {
  @apply cursor-pointer;
}

.menu-link--child {
  @apply pl-8 lg:pl-6;
}

.menu-link.router-link-exact-active {
  @apply text-[#FC6A03] font-semibold bg-orange-50 dark:bg-orange-950/20;
  border-right: 3px solid #FC6A03;
}

.menu-arrow {
  @apply text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2 transition-transform duration-200;
}

.accordion-children {
  overflow: hidden;
}

.menu-flyout {
  @apply absolute left-0 lg:left-full w-full lg:w-56 bg-white dark:bg-[#14141f] border-l border-gray-200 dark:border-gray-800 overflow-y-auto z-50 hidden lg:block;
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.15);
}

.flyout-enter-active {
  transition: all 0.2s ease-out;
}
.flyout-leave-active {
  transition: all 0.15s ease-in;
}
.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
}
.flyout-enter-from {
  transform: translateX(-8px);
}
.flyout-leave-to {
  transform: translateX(8px);
}
</style>
