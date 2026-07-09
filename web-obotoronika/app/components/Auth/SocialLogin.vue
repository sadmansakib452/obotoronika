<script setup lang="ts">
import { UDivider } from '#components'

const { socialLogin } = useAuth()
</script>

<template>
  <UDivider label="OR" class="mt-4" />
  <div class="flex gap-2 mt-4 flex-col lg:flex-row">
    <button
      class="rounded-md py-2.5 bg-[#faf6f2] flex justify-center items-center gap-2 font-semibold dark:bg-theme-border obotoronika-text-color lg:w-1/2"
      @click="socialLogin('facebook')"
    >
      <Icon name="mingcute:facebook-fill" class="text-[#1877f2] text-xl" />
      with Facebook
    </button>
    <button
      class="rounded-md py-2.5 bg-[#faf6f2] flex justify-center items-center gap-2 font-semibold dark:bg-theme-border obotoronika-text-color lg:w-1/2"
      @click="socialLogin('google')"
    >
      <Icon name="flat-color-icons:google" class="text-xl" />
      with Google
    </button>
  </div>
</template>
