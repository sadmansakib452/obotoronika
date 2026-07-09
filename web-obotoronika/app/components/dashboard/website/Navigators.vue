<script setup lang="ts">
const navItems = [
  { label: 'General', to: '/dashboard/website/settings/general' },
  { label: 'Appearance', to: '/dashboard/website/settings/appearance' },
  { label: 'SEO', to: '/dashboard/website/settings/seo' },
  { label: 'Domains', to: '/dashboard/website/settings/domains' },
]
</script>

<template>
  <div>
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.to" class="nav-item">
        <ActiveNavButton :to="item.to" exact>
          {{ item.label }}
        </ActiveNavButton>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.nav-list {
  @apply flex list-none p-0 mt-2 mb-6 gap-4;
}

.nav-item {
  margin: 0;
}

/* Responsive design for smaller screens */
@media (max-width: 600px) {
  .nav-list {
    @apply flex-col;
    align-items: flex-start;
  }
}
</style>
