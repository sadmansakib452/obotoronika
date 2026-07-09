<script lang="ts" setup>
import { UButton } from '#components'

const auth = useAuthStore()
</script>

<template>
  <div
    class="relative flex items-center justify-between rounded-lg bg-white p-5 sm:p-6 lg:p-7  border obotoronika-border-color pb-8 @4xl:col-span-2 @7xl:col-span-8 lg:pb-9 dark:bg-dark"
  >
    <div class="2xl:max-w-[calc(100%-340px)]">
      <h2 class="mb-2 font-Homenaje text-2xl sm:mb-3 md:text-3xl font-semibold tracking-widest obotoronika-title">
        {{ getGreetingMessage() }}, {{ auth.user.user_metadata.name.split(' ')[0] }}
      </h2>
      <p class="mb-5 text-sm leading-[1.6] sm:mb-6 sm:text-base md:mb-8 obotoronika-text-color">
        Here's what happening on your store today. See the statistics at once.
      </p>
      <UButton
        icon="i-heroicons-plus"
        size="lg"
        color="primary"
        variant="solid"
        label="Add Product"
        to="/dashboard/products/new"
      />
    </div>
    <div class="absolute -bottom-6 end-4 hidden w-[300px] @2xl:block lg:w-[290px] 2xl:-bottom-7 2xl:w-[290px]">
      <div class="relative">
        <img src="/images/dashboard/shop-illustration.png" alt="Welcome shop image" class="dark:brightness-95 dark:drop-shadow-md">
      </div>
    </div>
  </div>
</template>
