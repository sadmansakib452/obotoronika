<script lang="ts" setup></script>

<template>
  <div class="mt-8">
    <h4 class="font-medium obotoronika-text text-sm">
      Select Size
    </h4>
    <div class="sizes">
      <button>6</button>
      <button>7</button>
      <button>8</button>
      <button>9</button>
      <button>10</button>
      <button>11</button>
    </div>
  </div>
</template>

<style scoped>
.sizes {
    @apply grid grid-cols-7 gap-1 mt-1.5 w-2/3;

    button {
        @apply border-2 obotoronika-border-color w-fit px-4 py-2 rounded-md obotoronika-text;
    }
}
</style>
