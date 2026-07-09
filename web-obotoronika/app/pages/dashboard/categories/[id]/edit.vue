<script lang="ts" setup>
useHead({
  title: 'Edit category | Obotoronika',
})

definePageMeta({
  roles: ['admin', 'super_admin'],
})
</script>

<template>
  <DashboardCategoriesForm />
</template>
