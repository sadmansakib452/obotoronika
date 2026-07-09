<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
const store = useProductsStore()

// @ts-ignore
await store.fetchSectionProducts()
</script>

<template>
  <section v-for="section in store.sectionProducts" :key="section.id" class="products">
    <AtomsSectionTitle :title="section.title" :description="section.description" />
    <div class="products-lists">
      <AtomsProduct v-for="item in section.products" :key="item.id" :product="item" />
    </div>
    <NuxtLink class="mx-auto btn-2 px-4 py-2 mt-10" :to="`/sections/${section.slug}`">
      <span>See More</span>
      <Icon name="material-symbols:arrow-insert-rounded" class="text-xl rotate-90" />
    </NuxtLink>
  </section>
</template>

<style>
@import url('./styles/index.css');
</style>
