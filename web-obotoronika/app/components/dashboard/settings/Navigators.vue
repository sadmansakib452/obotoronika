<template>
  <div>
    <ul class="nav-list">
      <li class="nav-item">
        <NuxtLink to="/dashboard/settings/general" class="nav-link">General</NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink to="/dashboard/settings/security" class="nav-link">Security</NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink to="/dashboard/settings/notifications" class="nav-link">Notifications</NuxtLink>
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

.nav-link {
  @apply obotoronika-text-color no-underline py-2 px-4 rounded-md;
  transition: background-color 0.3s, color 0.3s;
}

.nav-link:hover {
  @apply text-primary bg-white dark:bg-dark;
}

/* Optional: Active link styling */
.nav-link[aria-current="page"] {
  @apply bg-primary text-white;
}

/* Responsive design for smaller screens */
@media (max-width: 600px) {
  .nav-list {
    @apply flex-col;
    align-items: flex-start;
  }
}
</style>
