<script setup lang="ts">
// @ts-ignore
import type { NuxtError } from '#app'
import { UButton } from '#components'

const props = defineProps({
  error: Object as () => NuxtError,
})

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  }
  else {
    router.push('/')
  }
}

useHead({
  title: `${props.error?.statusCode} | Obotoronika`,
})
</script>

<template>
  <div class="flex flex-col justify-center items-center h-screen">
    <img
      v-if="props.error?.statusCode === 404"
      class="w-[50vw] h-auto lg:h-[50vh]"
      src="/svg/404.svg"
      alt=""
      srcset=""
    >
    <img v-else src="/svg/500.svg" class="w-[50vw]  h-auto lg:h-[50vh]">
    <UButton class="w-32 mt-4" block @click="goBack">
      Go Back
    </UButton>
  </div>
</template>
