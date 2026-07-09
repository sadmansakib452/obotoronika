<script lang="ts" setup>
import { useProductsStore } from '@/stores/products'

const store = useProductsStore()
const { featuredProducts, isLoading } = storeToRefs(store)

onMounted(async () => {
  await store.fetchFeaturedProducts()
})
</script>

<template>
  <section class="featured-products">
    <AtomsSectionTitle title="New Arrivals" description="Fresh styles you'll love, just landed." />
    <div class="featured-products-lists">
      <div v-if="!isLoading">
        <AtomsProduct
          v-for="(item, index) in featuredProducts"
          :key="index"
          :product="item"
        />
      </div>
      <AtomsSkeletonProduct v-for="n in 5" v-else :key="n" />
    </div>
  </section>
</template>

<style>
@import url('./styles/featured.css');
</style>
