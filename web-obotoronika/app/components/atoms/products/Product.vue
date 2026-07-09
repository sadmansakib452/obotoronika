<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
// let StarRating: any
// if (typeof window !== 'undefined') {
//     // @ts-ignore
//     StarRating = (await import('vue-star-rating')).default
// }

const { isMobile } = useDevice()
</script>

<template>
  <div class="single-item">
    <NuxtLink to="/products/cap">
      <img src="/images/products/product-1.jpg" alt="">
    </NuxtLink>
    <div class="actions">
      <button>
        <Icon name="ic:outline-add" />
      </button>
      <button>
        <Icon name="solar:eye-linear" />
      </button>
      <button>
        <Icon name="mdi:heart-outline" />
      </button>
    </div>
    <div class="item-content">
      <h3>Brown hat craft</h3>
      <p>Tk 500.00</p>
      <!-- <star-rating class="w-fit mx-auto" :increment="0.1" :max-rating="5" inactive-color="#000"
                active-color="orange" :star-size="isMobile ? 15 : 30" :rating="4.65" read-only /> -->
    </div>
  </div>
</template>

<style>
.single-item {
    @apply w-full rounded-md relative mb-0 lg:mb-6 lg:w-[326px];

    img {
        @apply w-full h-40 object-cover rounded-lg lg:h-[326px];
    }

    .actions {
        @apply absolute bottom-20 flex justify-center items-center w-full gap-1 lg:hidden;

        button {
            @apply bg-white text-gray-900 border rounded-full flex justify-center items-center w-8 h-8 lg:w-10 lg:h-10;
        }
    }

    .item-content {
        @apply text-center mt-4;

        h3 {
            @apply font-semibold;
        }
    }

    &:hover .actions {
        @apply flex;
    }

    .vue-star-rating-rating-text {
        @apply hidden;
    }
}
</style>
