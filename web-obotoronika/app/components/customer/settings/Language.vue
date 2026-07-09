<script lang="ts" setup>
import { Globe } from 'lucide-vue-next'
</script>

<template>
  <div class="w-11/12 mx-auto mt-6 border obotoronika-border-color p-4 rounded-md lg:mx-0 xl:w-1/2">
    <div>
      <div class="flex items-center gap-2">
        <Globe class="text-primary" :size="24" />
        <h3 class="font-Homenaje text-xl obotoronika-title">
          Language
        </h3>
      </div>
      <p class="obotoronika-muted-text text-xs mt-1">
        Set your preferred language.
      </p>
    </div>
  </div>
</template>
