<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const props = withDefaults(defineProps<{ name: string, class?: string }>(), {
  name: '',
  class: '',
})
</script>

<template>
  <Icon :icon="props.name" :class="props.class" />
</template>
