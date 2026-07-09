<script lang="ts" setup>
import { UBreadcrumb } from '#components'

const links = [{
  label: 'Categories',
  icon: 'fluent-mdl2:product-variant',
  to: '/dashboard/categories',
}, {
  label: 'Create category',
  icon: 'i-heroicons-plus',
}]

useHead({
  title: 'Create Category | Obotoronika',
})
definePageMeta({
  roles: ['admin', 'super_admin'],
})
</script>

<template>
  <div>
    <UBreadcrumb title="Create Category" :links="links" />
    <main class="mt-8">
      <DashboardCategoriesForm />
    </main>
  </div>
</template>
