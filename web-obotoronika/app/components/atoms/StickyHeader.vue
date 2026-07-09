<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { cn } from '@/lib/utils'

interface IStickyHeaderProps {
  offset?: number
  class?: string
}

const props = withDefaults(defineProps<IStickyHeaderProps>(), {
  offset: 2,
  class: '',
})
const scroll = useWindowScroll()
const onScrollClass = ref('')
const defaultClass = computed(() =>
  cn(
    'top-0 z-[9999] flex items-center p-4 backdrop-blur-2xl dark:bg-dark md:px-5 lg:px-6 w-full left-0 px-4 sticky bg-white border-b obotoronika-border-color',
    props.class,
    onScrollClass,
  ),
)

onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  scroll.y.value > props.offset ? (onScrollClass.value = 'card-shadow') : ''
})
</script>

<template>
  <header :class="defaultClass">
    <slot />
  </header>
</template>

<style scoped></style>
