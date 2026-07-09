<template>
  <StickyHeader :class="cn('sticky-header', headerClass)">
    <div class="flex w-full max-w-2xl items-center">
      <HamburgerButton />
      <SearchWidget />
    </div>
    <RightMenu />
  </StickyHeader>
</template>

<script lang="ts" setup>
import HamburgerButton from './hamburger-button.vue'
import RightMenu from './RightMenu.vue'
import SearchWidget from './SearchWidget.vue'
import { cn } from '@/lib/utils'
import StickyHeader from '@/components/atoms/StickyHeader.vue'

const props = withDefaults(defineProps<{ class?: string }>(), {
  class: '',
})
const headerClass = computed(() => props.class)
</script>

<style lang="scss">
.sticky-header {
    @apply z-[990] 3xl:px-8 4xl:px-10 py-3;

    .wrapper {
        @apply flex w-full max-w-2xl items-center;

        .logo {
            @apply me-4 w-9 shrink-0 lg:me-5 xl:hidden;
        }
    }
}
</style>
