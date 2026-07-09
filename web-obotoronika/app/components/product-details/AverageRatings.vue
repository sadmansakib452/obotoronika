<template>
  <div class="w-full pb-7 lg:flex lg:flex-wrap">
    <div class="flex shrink-0 flex-col justify-center border-gray-100 pb-6 lg:w-44 lg:border-e lg:pb-0">
      <div class="pb-3 text-5xl font-bold obotoronika-title">
        {{ ratings }}
      </div>
      <p class="obotoronika-muted-text">
        <span>{{ totalReviews }}</span> Verified Buyers
      </p>
    </div>
    <div class="space-y-3 py-0.5 lg:ps-10 5xl:w-auto">
      <RatingProgressBar
        v-for="(count, index) in ratingProgress"
        :key="index"
        :label="index + 1"
        :rating-count="count"
        :total-reviews="totalReviews"
        :progress-bar-class-name="getProgressBarClass(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import RatingProgressBar from '@/components/RatingProgressBar.vue' // Adjust import path if needed

const props = defineProps({
  totalReviews: {
    type: Number,
    required: true,
  },
  ratings: {
    type: Number,
    required: true,
  },
  ratingCount: {
    type: Array,
    required: true,
  },
})

// Computed for rating progress
const ratingProgress = computed(() => {
  return props.ratingCount?.length ? props.ratingCount : [0, 0, 0, 0, 0]
})

// Method to get the progress bar color based on rating
const getProgressBarClass = (index) => {
  const classes = ['bg-red', 'bg-orange', 'bg-primary-light', 'bg-primary']
  return classes[index] || 'bg-gray-500'
}
</script>

  <style scoped>
  /* Add any additional styles if necessary */
  </style>
