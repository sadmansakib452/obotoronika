<script setup lang="ts">
defineOptions({ inheritAttrs: false }) // prevents automatic attr inheritance
const attrs = useAttrs()
</script>

<template>
  <div
    class="bg-white p-4 border obotoronika-border-color rounded-md dark:bg-dark"
    v-bind="attrs"
  >
    <slot />
  </div>
</template>
