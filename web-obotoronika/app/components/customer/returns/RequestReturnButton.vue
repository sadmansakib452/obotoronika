<script lang="ts" setup>
import { RotateCcw } from 'lucide-vue-next'
import { UButton } from '#components'

const props = defineProps<{
  order: any
}>()

const emit = defineEmits(['request-return'])

// Check if order is eligible for return/cancellation
const isEligible = computed(() => {
  if (!props.order) return false
  const eligibleStatuses = ['delivered', 'completed', 'processing', 'pending']
  return eligibleStatuses.includes(props.order.status)
})

const eligibleStatusText = computed(() => {
  if (!props.order) return ''
  const statusMap: Record<string, string> = {
    delivered: 'Available for return',
    completed: 'Available for return',
    processing: 'Available for cancellation',
    pending: 'Available for cancellation',
  }
  return statusMap[props.order.status] || 'Not eligible'
})
</script>

<template>
  <UButton
    v-if="isEligible"
    color="orange"
    variant="outline"
    size="sm"
    :icon="RotateCcw"
    @click="emit('request-return')"
  >
    Request Return
  </UButton>
  <p v-else class="text-xs obotoronika-muted-text">
    {{ eligibleStatusText }}
  </p>
</template>
