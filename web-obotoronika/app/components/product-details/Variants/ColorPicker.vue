<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
const props = defineProps<{
  colors: string[]
  type: string
}>()

const store = useProductsStore()

const handleColor = (color: { label: string, value: string }) => {
  const variant: Record<string, { label: string, value: string }> = {}
  variant[props.type] = { label: color.label, value: color.value }
  store.addVariant(variant)
}

const selectedColor = ref('')
</script>

<template>
  <fieldset class="swatch-group my-4">
    <h4 class="font-medium obotoronika-text text-sm">
      Select Color
    </h4>
    <div class="swatches">
      <label v-for="color in colors" :key="color.id" class="swatch-label">
        <input
          v-model="selectedColor"
          type="radio"
          name="color"
          :value="color.value"
          class="swatch-input"
          @click="() => handleColor(color)"
        >
        <span
          class="swatch"
          :style="{ backgroundColor: color.value }"
          :title="color.label"
        />
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
  @apply border obotoronika-border-color w-9 h-9 rounded-full cursor-pointer hover:outline hover:border-2 hover:outline-2 hover:border-white;
}
.swatch-input:checked + .swatch {
  @apply outline outline-2 outline-offset-1 outline-black dark:outline-white border-white border-2;
}
</style>
