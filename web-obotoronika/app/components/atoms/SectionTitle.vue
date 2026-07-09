<script lang="ts" setup>
interface Props {
  title: string
  description: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
})
</script>

<template>
  <div class="section-header">
    <h1>{{ props.title }}</h1>
    <p>{{ props.description }}</p>
  </div>
</template>

<style scoped>
.section-header {
    @apply text-center mb-8;

    h1 {
        @apply text-2xl font-Homenaje font-bold obotoronika-title lg:text-4xl;
    }

    p {
        @apply text-gray-600 text-base;
    }
}
</style>
