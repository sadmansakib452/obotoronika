<script lang="ts" setup>
import { colors } from '@/constants/index'
</script>

<template>
  <footer>
    <div class="wrapper">
      <AtomsLogo :width="100" :height="90" :fill="colors.primary" />
    </div>
    <div class="bottom-area">
      <p class="text-gray-300">
        &copy; {{ new Date().getFullYear() }} Obotoronika. All rights reserved.
      </p>
      <div>
        <ul>
          <li>
            <NuxtLink to="/terms-and-conditions">Terms & Conditions</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/privacy-policy">Privacy Policy</NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<style>

</style>
