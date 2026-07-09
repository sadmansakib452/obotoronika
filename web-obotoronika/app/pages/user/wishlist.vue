<script lang="ts" setup>
definePageMeta({
  roles: ['customer', 'super_admin'],
})
</script>

<template>
  <div class="w-10/12 my-8 ml-4">
    <div class="w-1/2 mb-6">
      <h3 class="font-Homenaje text-3xl obotoronika-title">
        Wishlist
      </h3>
      <p class="obotoronika-muted-text text-sm">
        Keep track of your favorite items and shop them whenever you're ready.
      </p>
    </div>
    <CustomerWishlist />
  </div>
</template>
