<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settings'
import AtomsLogo from '@/components/atoms/Logo.vue'

const store = useSettingsStore()
</script>

<template>
  <div
    v-if="store.isPageLoading"
    class="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-[#0f0f0f]/90"
  >
    <div class="animate-pulse">
      <AtomsLogo :bf="true" :width="100" :height="100" fill="#FC6A03" />
    </div>
    <p class="text-sm text-white/40 tracking-wider">Loading…</p>
  </div>
</template>
