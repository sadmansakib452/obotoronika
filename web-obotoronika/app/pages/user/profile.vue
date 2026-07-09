<script lang="ts" setup>
definePageMeta({
  roles: ['customer', 'super_admin'],
})

useHead({
  title: 'Mange Profile | Obotoronika',
})
</script>

<template>
  <div class="my-8 w-full mx-auto lg:w-9/12">
    <div
      class="w-11/12 mx-auto border p-4 rounded-md obotoronika-border-color xl:w-2/3"
    >
      <h3 class="font-Homenaje text-3xl obotoronika-title">
        Personal Information
      </h3>
      <p class="obotoronika-muted-text text-sm">
        Manage your personal details and contact information.
      </p>
      <CustomerProfileEditProfile />
    </div>
    <div
      class="w-11/12 mx-auto border p-4 rounded-md obotoronika-border-color mt-6 xl:w-2/3"
    >
      <h3 class="font-Homenaje text-3xl obotoronika-title">
        Change Password
      </h3>
      <p class="obotoronika-muted-text text-sm">
        Update your account password for security.
      </p>
      <CustomerProfileChangePassword />
    </div>
  </div>
</template>

<style>
</style>
