<script lang="ts" setup>
import { useProductsStore } from '@/stores/products'

const store = useProductsStore()
const { featuredProducts, isLoading } = storeToRefs(store)

const products = [
  {
    name: 'Casio Watch',
    thumbnail: '/images/products/product-2.jpg',
    shortDesc: 'Casio Classic Watch',
    price: 200,
    offer_price: 170,
    rating: 4.5,
  },
  {
    name: 'Beats Headphone',
    thumbnail: '/images/products/product-3.jpg',
    shortDesc: 'Beats Headphone',
    price: 1000,
    offer_price: 800,
    rating: 4.5,
  },
  {
    name: 'Marc Jacob\'s Decadent',
    thumbnail: '/images/products/product-4.jpg',
    shortDesc: 'Marc Jacob\'s Decadent',
    price: 400,
    offer_price: 300,
    rating: 4.5,
  },
  {
    name: 'Black Shoes',
    thumbnail: '/images/products/product-5.jpg',
    shortDesc: 'Black Shoes',
    price: 700,
    rating: 4.5,
  },
  {
    name: 'Casio Watch',
    thumbnail: '/images/products/product-6.jpg',
    shortDesc: 'Casio Classic Watch',
    price: 200,
    offer_price: 170,
    rating: 4.5,
  },
  {
    name: 'Beats Headphone',
    thumbnail: '/images/products/product-7.jpg',
    shortDesc: 'Beats Headphone',
    price: 1000,
    offer_price: 800,
    rating: 4.5,
  },
]

onMounted(async () => {
  await store.fetchFeaturedProducts()
})
</script>

<template>
  <section class="featured-products">
    <AtomsSectionTitle title="Featured Products" description="Handpicked favorites just for you." />
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
