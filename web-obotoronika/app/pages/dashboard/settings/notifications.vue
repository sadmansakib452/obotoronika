<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
setPageLayout('dashboard-settings-navigator')
definePageMeta({
  roles: ['super_admin', 'admin', 'manager', 'seller'],
})
</script>

<template>
  <div>
    <CustomCard>
      <div class="mb-4">
        <h3 class="font-Homenaje text-3xl obotoronika-title">
          Notification Preferences
        </h3>
        <p class="obotoronika-muted-text text-sm">
          Manage how you receive system alerts, reports, and important updates.
        </p>
      </div>
    </CustomCard>
  </div>
</template>
