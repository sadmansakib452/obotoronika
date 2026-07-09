<template>
  <main class="flex min-h-screen flex-grow w-full">
    <HydrogenSidebar class="fixed hidden xl:block dark:bg-gray-50" />
    <div class="flex w-full flex-col xl:ms-[270px] xl:w-[calc(100%-270px)] 2xl:ms-72 2xl:w-[calc(100%-288px)]">
      <HydrogenHeader />
      <div id="content">
        <slot />
      </div>
    </div>
  </main>
</template>

<script setup>
import HydrogenSidebar from './Sidebar.vue'
import HydrogenHeader from './Header.vue'

defineProps({
  project: Object,
})
</script>

<style lang="scss" scoped>
body {
    #content {
        @apply flex flex-grow flex-col px-4 pb-6 pt-2 md:px-5 lg:px-6 lg:pb-8 3xl:px-8 3xl:pt-4 4xl:px-10 4xl:pb-9;
    }
}
</style>
