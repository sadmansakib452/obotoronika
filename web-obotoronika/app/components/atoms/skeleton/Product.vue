<template>
  <div class="product-skeleton">
    <div class="img-skeleton" />
    <div class="meta-skeleton">
      <div class="title-skeleton" />
      <div class="price-skeleton" />
    </div>
  </div>
</template>

<style scoped>
.product-skeleton {
  @apply relative w-full mx-auto animate-pulse;

  .img-skeleton {
    @apply w-full h-[220px] lg:h-[320px] bg-gray-300 dark:bg-gray-700 rounded-md;
  }

  .meta-skeleton {
    @apply mt-4;

    .title-skeleton {
      @apply w-3/4 h-6 bg-gray-300 dark:bg-gray-700 rounded-md mb-2;
    }

    .price-skeleton {
      @apply w-1/2 h-4 bg-gray-300 dark:bg-gray-700 rounded-md;
    }
  }
}
</style>
