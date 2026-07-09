<script setup lang="ts">
</script>

<template>
  <UiPopover>
    <UiPopoverTrigger as-child>
      <AtomsActionButton icon="iconamoon:notification-duotone" />
    </UiPopoverTrigger>
    <UiPopoverContent class="w-80 z-[9999]" :align="'end'">
      notification
    </UiPopoverContent>
  </UiPopover>
</template>
