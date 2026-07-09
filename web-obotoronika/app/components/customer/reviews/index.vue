<script lang="ts" setup>
const reviewStore = useReviewStore()

onMounted(async () => {
  await reviewStore.getReviews()
})
</script>

<template>
  <div class="w-full border obotoronika-border-color p-4 rounded-md space-y-4 lg:w-1/2">
    <CustomerReviewsItem
      v-for="i in reviewStore.reviews.data"
      :key="i.product_id"
      :item="i"
      :to-review="false"
    />
    <!-- <CustomerReviewsReview v-for="i in reviewStore.reviews.data" :key="i.id" /> -->
  </div>
</template>
