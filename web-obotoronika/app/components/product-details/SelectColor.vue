<template>
  <div class="mt-8">
    <h4 class="font-medium obotoronika-text text-sm">
      Select Color
    </h4>
    <div class="colors">
      <button class="bg-red-500" />
      <button class="bg-green-500" />
      <button class="bg-blue-500" />
      <button class="bg-orange-500" />
      <button class="bg-white-500" />
    </div>
  </div>
</template>

<style scoped>
.colors {
    @apply grid grid-cols-7 gap-1 mt-1.5 w-1/3;
    button {
        @apply border obotoronika-border-color w-7 h-7 rounded-full;
    }
}
</style>
