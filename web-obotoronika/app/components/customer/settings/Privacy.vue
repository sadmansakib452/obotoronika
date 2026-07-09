<script lang="ts" setup>
import { ShieldUser } from 'lucide-vue-next'
</script>

<template>
  <div class="w-11/12 mx-auto mt-6 border obotoronika-border-color p-4 rounded-md lg:mx-0 xl:w-1/2">
    <div>
      <div class="flex items-center gap-2">
        <ShieldUser class="text-primary" :size="24" />
        <h3 class="font-Homenaje text-xl obotoronika-title">
          Privacy Settings
        </h3>
      </div>
      <p class="obotoronika-muted-text text-xs mt-1">
        Control how your data is used and shared for a personalized experience.
      </p>
    </div>
  </div>
</template>
