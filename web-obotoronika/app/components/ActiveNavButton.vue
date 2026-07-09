<!-- components/ActiveNavButton.vue -->
<script setup>
import { UButton } from '#components'

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  exact: {
    type: Boolean,
    default: true,
  },
})

const route = useRoute()

const isActive = computed(() => {
  if (props.exact) {
    return route.path === props.to
  }
  return route.path.startsWith(props.to)
})
</script>

<template>
  <UButton
    :to="to"
    :variant="isActive ? 'solid' : 'subtle'"
    class="w-full justify-start"
    v-bind="$attrs"
  >
    <slot />
  </UButton>
</template>
