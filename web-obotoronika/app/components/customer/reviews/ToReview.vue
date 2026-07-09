<script lang="ts" setup>
import { useReviewStore } from '@/stores/reviews'

const reviewStore = useReviewStore()

onMounted(async () => {
  await reviewStore.getToReviews()
})
</script>

<template>
  <div class="border obotoronika-border-color p-4 rounded-md space-y-4 lg:w-1/2">
    <CustomerReviewsItem
      v-for="i in reviewStore.to_reviews.data"
      :key="i.product_id"
      :item="i"
      :to-review="true"
    />
  </div>
</template>
