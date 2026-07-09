<script lang="ts" setup>
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import 'vue3-carousel/carousel.css'

const carouselConfig = {
  itemsToShow: 1,
  wrapAround: true,
  autoplay: 3000,
}

// Fetch banners from API
const { data: bannersData, pending, error } = await useFetch<{
  status: number
  message: string
  data: { banners: any[] }
}>('/api/banners', {
  default: () => ({
    status: 200,
    message: 'OK',
    data: { banners: [] },
  }),
})

const banners = computed(() => {
  if (bannersData.value && 'data' in bannersData.value && bannersData.value.data?.banners) {
    // Sort banners by display_order (ascending), with nulls last, then by id as fallback
    return [...bannersData.value.data.banners].sort((a, b) => {
      const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER
      const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER
      if (orderA !== orderB) {
        return orderA - orderB
      }
      // If display_order is the same (or both null), sort by id
      return (a.id || 0) - (b.id || 0)
    })
  }
  return []
})

const config = useRuntimeConfig()

// Helper function to get full image URL
const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return ''
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  // If it starts with /, it's a relative path
  if (imageUrl.startsWith('/')) {
    return `${config.public.mediaUrl}${imageUrl}`
  }
  // Otherwise, prepend media URL if available
  return config.public.mediaUrl ? `${config.public.mediaUrl}${imageUrl}` : imageUrl
}
</script>

<template>
  <div class="home-banner">
    <div v-if="pending" class="flex items-center justify-center min-h-[400px]">
      <p class="obotoronika-text">
        Loading banners...
      </p>
    </div>
    <div v-else-if="error" class="flex items-center justify-center min-h-[400px]">
      <p class="obotoronika-text text-red-500">
        Failed to load banners
      </p>
    </div>
    <Carousel v-else-if="banners.length > 0" v-bind="carouselConfig">
      <Slide v-for="(banner, index) in banners" :key="banner.id || index">
        <div class="carousel__item">
          <div class="hero-slide">
            <img :src="getImageUrl(banner.image_url)" :alt="banner.title || `Banner ${index + 1}`">
            <div class="slide-content">
              <div class="content-container">
                <h1 v-if="banner.title">
                  {{ banner.title }}
                </h1>
                <p v-if="banner.description">
                  {{ banner.description }}
                </p>
                <NuxtLink
                  v-if="banner.button_link"
                  :to="banner.button_link.startsWith('/products?category=') ? '/sections/' + banner.button_link.split('=')[1] : banner.button_link"
                  class="btn-1 !w-fit mr-auto ml-0"
                >
                  <span>{{ banner.button_text || 'Shop Now' }}</span>
                  <Icon
                    name="material-symbols:arrow-insert-rounded"
                    class="text-xl rotate-90"
                  />
                </NuxtLink>
                <button
                  v-else
                  class="btn-1 !w-fit mr-auto ml-0"
                >
                  <span>{{ banner.button_text || 'Shop Now' }}</span>
                  <Icon
                    name="material-symbols:arrow-insert-rounded"
                    class="text-xl rotate-90"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Slide>
      <template #addons>
        <Navigation />
        <Pagination />
      </template>
    </Carousel>
    <div v-else class="flex items-center justify-center min-h-[400px]">
      <p class="obotoronika-text">
        No banners available
      </p>
    </div>
  </div>
</template>

<style scoped>
@import url('./styles/banner.css');
</style>
