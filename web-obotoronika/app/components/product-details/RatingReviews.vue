<script setup lang="ts">
import AverageRatings from './AverageRatings.vue'
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold obotoronika-title">
      Ratings & Reviews
    </h3>
    <AverageRatings
      :ratings="4.1"
      :total-reviews="3"
      :rating-count="[0, 0, 7, 4, 3]"
    />
    <ReviewCard />
  </div>
</template>
