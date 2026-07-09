<script lang="ts" setup>
definePageMeta({
  roles: ['customer', 'super_admin'],
})
</script>

<template>
  <div class="my-8 lg:ml-4 lg:w-10/12">
    <div class="w-11/12 mx-auto lg:mx-0 xl:w-1/2">
      <h3 class="font-Homenaje text-3xl obotoronika-title">
        Account Settings
      </h3>
      <p class="obotoronika-muted-text text-sm">
        Manage your personal information, notification preferences, security,
        and account controls for a seamless shopping experience.
      </p>
    </div>
    <CustomerSettingsNotification />
    <CustomerSettingsLanguage />
    <CustomerSettingsSecurity />
    <CustomerSettingsPrivacy />
    <CustomerSettingsAccountControl />
  </div>
</template>
