<template>
  <div class="flex items-center text-sm">
    <div class="flex w-11 shrink-0 items-center space-x-1 font-semibold">
      <span class="text-sm font-semibold obotoronika-text block w-3">{{ label }}</span>
      <Icon name="line-md:star-filled" class="fill-orange-500 text-orange-500" size="16" />
    </div>
    <div class="relative h-1 w-52 overflow-hidden rounded-md bg-primary">
      <div
        :class="['absolute h-full rounded-md', progressBarClassName]"
        :style="{ width: `${(ratingCount / totalReviews) * 100}%` }"
      />
    </div>
    <div class="shrink-0 ps-5 obotoronika-text">
      {{ ratingCount ?? 0 }}
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  label: {
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    required: true,
  },
  totalReviews: {
    type: Number,
    required: true,
  },
  progressBarClassName: {
    type: String,
    default: 'bg-primary',
  },
})

// Importing PiStarFill Icon
</script>

  <style scoped>
  /* Tailwind CSS classes should work without extra styles here. */
  </style>
