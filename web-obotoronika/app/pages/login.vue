<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Login | Obotoronika',
})

const router = useRouter()
function handleLoginSuccess() {
  router.push('/').then(() => {
    // Ensure header/account UI reflects the new session immediately
    if (import.meta.client) window.location.reload()
  })
}
</script>

<template>
  <div class="w-full flex justify-center px-4 py-10">
    <div class="w-full max-w-lg border obotoronika-border-color rounded-md dark:bg-[#14141f]">
      <Auth @login-success="handleLoginSuccess" />
    </div>
  </div>
</template>
