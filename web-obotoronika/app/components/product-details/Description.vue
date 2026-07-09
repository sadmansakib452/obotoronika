<script lang="ts" setup>
const props = defineProps<{
  desc: string
  tags: string[]
}>()
</script>

<template>
  <div class="w-11/12">
    <h3 class="text-lg font-semibold obotoronika-title mb-4">
      Product Details
    </h3>
    <!-- // eslint-disable-next-line vue/no-v-html -->
    <!-- <div v-if="props.desc" class="product-details" v-html="props.desc" /> -->
    <div v-if="props.desc" class="product-details">
      {{ props.desc }}
    </div>
    <div class="tags">
      <ul>
        <p>
          <Icon name="tabler:tags" size="20" />
          <span>Tags:</span>
        </p>
        <li v-for="tag in props.tags" :key="tag">
          {{ tag }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
@import url('./css/desc.css');
</style>
