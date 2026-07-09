<script lang="ts" setup>
import { ref, watch } from 'vue'
import { UInput } from '#components'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'change', value: string): void
}>()

const size = ref(props.modelValue)

// Sync prop -> local
watch(() => props.modelValue, (val) => {
  size.value = val
})

// Sync local -> emit
watch(size, (val) => {
  emit('update:modelValue', val)
  emit('change', val)
})
</script>

<template>
  <UInput
    v-model="size"
    placeholder="Enter size (e.g. M, L, 42)"
  />
</template>
