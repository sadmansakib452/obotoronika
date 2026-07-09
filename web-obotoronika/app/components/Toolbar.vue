<template>
  <div
    class="flex justify-between items-center border-t border-b py-2 mt-3 -mx-8 px-8 border-gray-100 dark:border-theme-border"
  >
    <div class="flex gap-4 items-center">
      <slot name="left" />
    </div>
    <div class="flex gap-4 items-center">
      <slot name="right" />
    </div>
  </div>
</template>
