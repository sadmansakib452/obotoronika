<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'change', value: string): void
}>()

// ✅ Use ref that’s fully in sync with modelValue
const color = ref(props.modelValue)

// 🔁 Always keep color in sync with modelValue from parent
watch(
  () => props.modelValue,
  (newVal) => {
    color.value = newVal
  },
)

// 🔁 Emit both model update and change
watch(color, (val) => {
  emit('update:modelValue', val)

  emit('change', val)
})
</script>

<template>
  <div>
    <color-picker-block :key="color" v-model="color" with-hex-input />
  </div>
</template>
