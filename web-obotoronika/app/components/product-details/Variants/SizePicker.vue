<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
const props = defineProps<{
  sizes: string[]
  type: string
}>()

const selectedSize = ref(props.sizes[0] ?? '')

const store = useProductsStore()

const handleColor = (size: { label: string, value: string }) => {
  const variant: Record<string, { label: string, value: string }> = {}
  variant[props.type] = { label: size.label, value: size.value }
  store.addVariant(variant)
}
</script>

<template>
  <fieldset class="swatch-group my-4">
    <h4 class="font-medium obotoronika-text text-sm">
      Select Size
    </h4>
    <div class="swatches">
      <label v-for="size in sizes" :key="size.id" class="swatch-label">
        <input
          v-model="selectedSize"
          type="radio"
          name="size"
          :value="size.value"
          class="swatch-input"
          @click="() => handleColor(size)"
        >
        <span class="swatch size-swatch" :title="size.label">{{ size.label }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.swatches {
  @apply flex gap-2 my-2 flex-wrap;
}
.swatch-label {
  display: flex;
  align-items: center;
}
.swatch-input {
  display: none;
}
.swatch {
  @apply border obotoronika-border-color w-auto h-9 rounded-full cursor-pointer flex items-center justify-center text-sm font-medium px-4;
}
.swatch-input:checked + .swatch {
  @apply bg-black text-white;
}
.size-swatch {
  @apply bg-white text-black;
}
</style>
