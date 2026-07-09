<script lang="ts" setup>
const props = defineProps<{
  variants: VariantOption[]
}>()
</script>

<template>
  <div class="mt-8">
    <div v-for="(item, index) in props.variants" :key="index">
      <ProductDetailsVariantsSizePicker
        v-if="item && Object.keys(item)[0].includes('size')"
        :sizes="item[Object.keys(item)[0]] ?? []"
        :type="Object.keys(item)[0]"
      />
      <ProductDetailsVariantsColorPicker
        v-if="item && Object.keys(item)[0].includes('color')"
        :colors="item[Object.keys(item)[0]] ?? []"
        :type="Object.keys(item)[0]"
      />
    </div>
  </div>
</template>
