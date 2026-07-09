<script lang="ts" setup>
import Icon from './Icon.vue'
import { cn } from '@/lib/utils'

interface Props {
  icon: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  class: '',
})
</script>

<template>
  <button
    :class="cn('border border-muted w-10 h-10 rounded-md shadow-sm bg-white active:translate-y-px text-xl flex justify-center items-center dark:bg-dark dark:border-theme-border obotoronika-text-color', props.class)"
  >
    <Icon :name="props.icon" />
  </button>
</template>
