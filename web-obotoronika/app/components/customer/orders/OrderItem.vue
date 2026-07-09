<script lang="ts" setup>
import { format, parseISO } from 'date-fns'
import { useOrderStatusStyles } from '@/composables/useOrderStatusStyles'
import { UBadge, UButton, UIcon, UModal, USelect, UTextarea } from '#components'

const config = useRuntimeConfig()

type Order = {
  order_id: string
  status: string
  total_amount: number
  payment_method: string | null
  created_at: string
  first_product: {
    title: string
    thumbnail: string
    quantity: number
    price: number
  } | null
  more_products_count: number
}

type RefundStatus = {
  has_refund_request: boolean
  refund_status: string | null
  refund_id: string | null
}

type CancelStatus = {
  has_cancel_request: boolean
  cancel_status: string | null
  cancel_id: string | null
}

const props = defineProps<{
  item: Order
}>()

const emit = defineEmits<{
  (e: 'order-cancelled', orderId: string): void
  (e: 'refund-requested', orderId: string): void
}>()

const { getOrderStatusClasses } = useOrderStatusStyles()
const statusClasses = (status: string) => getOrderStatusClasses(status)

// Cancel modal state
const isOpenCancelModal = ref(false)
const cancelReason = ref('')
const isCancelling = ref(false)

// Cancel status state
const cancelStatus = ref<CancelStatus | null>(null)
const isLoadingCancelStatus = ref(false)

// Refund modal state
const isOpenRefundModal = ref(false)
const refundReason = ref('')
const refundMessage = ref('')
const isSubmittingRefund = ref(false)
const refundStatus = ref<RefundStatus | null>(null)
const isLoadingRefundStatus = ref(false)

const toast = useToast()

const canCancel = computed(() => {
  const cancellableStatuses = ['processing', 'pending', 'awaiting_payment']
  return cancellableStatuses.includes(props.item.status) &&
    !cancelStatus.value?.has_cancel_request
})

const canRequestRefund = computed(() => {
  return props.item.status === 'delivered' &&
    !refundStatus.value?.has_refund_request
})

const paymentMethodLabel = computed(() => {
  const method = props.item.payment_method
  if (!method) return '—'
  const labels: Record<string, string> = {
    cod: 'Cash on Delivery',
    card: 'Card Payment',
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
  }
  return labels[method] || method
})

onMounted(async () => {
  const cancellableStatuses = ['processing', 'pending', 'awaiting_payment']
  if (cancellableStatuses.includes(props.item.status)) {
    await checkCancelStatus()
  }
  if (props.item.status === 'delivered') {
    await checkRefundStatus()
  }
})

const checkRefundStatus = async () => {
  isLoadingRefundStatus.value = true
  try {
    const response = await fetch(`/api/orders/${props.item.order_id}/refund-status`)
    const result = await response.json()
    if (result.success) {
      refundStatus.value = result.data
    }
  }
  catch (error) {
    console.error('Failed to check refund status:', error)
  }
  finally {
    isLoadingRefundStatus.value = false
  }
}

const checkCancelStatus = async () => {
  isLoadingCancelStatus.value = true
  try {
    const response = await fetch(`/api/orders/${props.item.order_id}/cancel-status`)
    const result = await response.json()
    if (result.success) {
      cancelStatus.value = result.data
    }
  }
  catch (error) {
    console.error('Failed to check cancel status:', error)
  }
  finally {
    isLoadingCancelStatus.value = false
  }
}

const handleCancelOrder = async () => {
  if (isCancelling.value) return

  isCancelling.value = true

  try {
    const response = await fetch(`/api/orders/${props.item.order_id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: cancelReason.value || null,
      }),
    })

    const result = await response.json()

    if (result.success) {
      toast.add({
        title: 'Cancellation Request Submitted',
        description: `Your cancellation request (#${result.data.request_id}) has been submitted for admin approval.`,
        color: 'green',
        icon: 'i-heroicons-check-circle',
      })

      // Update local cancel status
      cancelStatus.value = {
        has_cancel_request: true,
        cancel_status: 'pending',
        cancel_id: result.data.request_id,
      }

      emit('order-cancelled', props.item.order_id)

      isOpenCancelModal.value = false
      cancelReason.value = ''
    }
    else {
      toast.add({
        title: 'Request Failed',
        description: result.message || 'Could not submit cancellation request. Please try again.',
        color: 'red',
        icon: 'i-heroicons-exclamation-circle',
      })
    }
  }
  catch (error: any) {
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.',
      color: 'red',
      icon: 'i-heroicons-exclamation-circle',
    })
  }
  finally {
    isCancelling.value = false
  }
}

const openCancelModal = () => {
  cancelReason.value = ''
  isOpenCancelModal.value = true
}

const handleSubmitRefund = async () => {
  if (isSubmittingRefund.value || !refundReason.value) return

  isSubmittingRefund.value = true

  try {
    const response = await fetch(`/api/orders/${props.item.order_id}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: refundReason.value,
        message: refundMessage.value || null,
      }),
    })

    const result = await response.json()

    if (result.success) {
      toast.add({
        title: 'Refund Request Submitted',
        description: `Your refund request (#${result.data.refund_id}) has been submitted for review.`,
        color: 'green',
        icon: 'i-heroicons-check-circle',
      })

      refundStatus.value = {
        has_refund_request: true,
        refund_status: 'pending',
        refund_id: result.data.refund_id,
      }

      emit('refund-requested', props.item.order_id)

      isOpenRefundModal.value = false
      refundReason.value = ''
      refundMessage.value = ''
    }
    else {
      toast.add({
        title: 'Request Failed',
        description: result.message || 'Could not submit refund request. Please try again.',
        color: 'red',
        icon: 'i-heroicons-exclamation-circle',
      })
    }
  }
  catch (error: any) {
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.',
      color: 'red',
      icon: 'i-heroicons-exclamation-circle',
    })
  }
  finally {
    isSubmittingRefund.value = false
  }
}

const openRefundModal = () => {
  refundReason.value = ''
  refundMessage.value = ''
  isOpenRefundModal.value = true
}

const getRefundStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
  }
  return map[status] || 'gray'
}
</script>

<template>
  <tr class="border-b obotoronika-border-color hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
    <!-- Order ID & Date -->
    <td class="px-4 py-4">
      <div class="font-medium text-sm obotoronika-title">
        #{{ item.order_id }}
      </div>
      <div class="text-xs obotoronika-muted-text mt-0.5">
        {{
          format(
            parseISO(item.created_at),
            "MMM d, yyyy, h.mm aaa",
          ).toUpperCase()
        }}
      </div>
    </td>

    <!-- Status -->
    <td class="px-4 py-4">
      <div class="flex flex-col gap-1">
        <span
          :class="['font-medium text-xs capitalize px-2 py-1 rounded-full w-fit', statusClasses(item.status)]"
        >
          {{ item.status === 'canceled' ? 'cancelled' : item.status }}
        </span>
        <UBadge
          v-if="cancelStatus?.has_cancel_request"
          :label="`Cancellation: ${cancelStatus.cancel_status}`"
          :color="getRefundStatusColor(cancelStatus.cancel_status)"
          variant="subtle"
          size="xs"
        />
        <UBadge
          v-if="refundStatus?.has_refund_request"
          :label="`Refund: ${refundStatus.refund_status}`"
          :color="getRefundStatusColor(refundStatus.refund_status)"
          variant="subtle"
          size="xs"
        />
      </div>
    </td>

    <!-- Products -->
    <td class="px-4 py-4 min-w-0">
      <div v-if="item.first_product" class="flex items-center gap-3">
        <div class="relative shrink-0">
          <img
            :src="`${config.public.mediaUrl}${item.first_product.thumbnail}`"
            :alt="item.first_product.title"
            class="w-12 h-12 object-cover rounded-md border shrink-0"
          >
          <span
            v-if="item.more_products_count"
            class="px-1 text-[10px] w-auto h-4 bg-gray-700 text-white absolute -right-1 -top-1 rounded-md flex justify-center items-center"
          >
            +{{ item.more_products_count }}
          </span>
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-800 leading-snug line-clamp-2 dark:text-dark-text">
            {{ item.first_product.title }}
          </p>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ item.first_product.quantity }}x ৳{{ item.first_product.price }}
          </span>
        </div>
      </div>
      <span v-else class="text-sm obotoronika-muted-text">—</span>
    </td>

    <!-- Total -->
    <td class="px-4 py-4">
      <span class="font-semibold text-sm obotoronika-title">৳{{ item.total_amount }}</span>
    </td>

    <!-- Payment -->
    <td class="px-4 py-4">
      <span class="text-sm obotoronika-muted-text">{{ paymentMethodLabel }}</span>
    </td>

    <!-- Actions -->
    <td class="px-4 py-4">
      <div class="flex flex-wrap gap-2">
        <UButton
          v-if="!isLoadingCancelStatus && canCancel"
          icon="i-heroicons-no-symbol"
          color="red"
          size="xs"
          @click="openCancelModal"
        >
          Cancel
        </UButton>

        <UButton
          v-if="item.status === 'delivered' && !isLoadingRefundStatus && canRequestRefund"
          icon="i-heroicons-currency-dollar"
          color="orange"
          size="xs"
          @click="openRefundModal"
        >
          Refund
        </UButton>

        <UButton
          v-if="item.status === 'delivered' && refundStatus?.has_refund_request"
          icon="i-heroicons-eye"
          color="white"
          size="xs"
          variant="soft"
        >
          Refund Status
        </UButton>

        <UButton
          :to="`/user/orders/${item.order_id}`"
          icon="i-heroicons-arrow-right"
          color="white"
          size="xs"
          variant="soft"
        >
          Details
        </UButton>
      </div>
    </td>
  </tr>

  <!-- ==================== CANCEL MODAL ==================== -->
  <UModal v-model="isOpenCancelModal" :ui="{ width: 'w-full sm:max-w-md' }">
    <div class="p-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-600" />
        </div>
        <h3 class="font-Homenaje text-xl obotoronika-title">
          Cancel Order
        </h3>
      </div>

      <p class="obotoronika-muted-text text-sm mb-4">
        Submit a cancellation request for order <strong>#{{ item.order_id }}</strong>.
        An admin will review your request.
      </p>

      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
        <p class="text-sm text-blue-700 dark:text-blue-400">
          <UIcon name="i-heroicons-information-circle" class="w-4 h-4 inline mr-1" />
          {{ item.payment_method === 'cod' ? 'Your order will be cancelled and stock restored upon approval.' : 'If approved, your payment will be refunded to your original payment method.' }}
        </p>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">
          Reason for cancellation <span class="text-red-500">*</span>
        </label>
        <USelect
          v-model="cancelReason"
          :options="[
            { value: '', label: 'Select a reason' },
            { value: 'Changed mind', label: 'Changed my mind' },
            { value: 'Found better price', label: 'Found better price elsewhere' },
            { value: 'Ordered by mistake', label: 'Ordered by mistake' },
            { value: 'Long delivery time', label: 'Delivery time too long' },
            { value: 'Other', label: 'Other reason' },
          ]"
          value-attribute="value"
          option-attribute="label"
          placeholder="Select a reason"
        />
      </div>

      <div class="flex justify-end gap-3">
        <UButton
          label="Keep Order"
          color="gray"
          variant="soft"
          @click="isOpenCancelModal = false"
        />
        <UButton
          label="Submit Request"
          color="red"
          :loading="isCancelling"
          :disabled="!cancelReason"
          @click="handleCancelOrder"
        />
      </div>
    </div>
  </UModal>

  <!-- ==================== REFUND MODAL ==================== -->
  <UModal v-model="isOpenRefundModal" :ui="{ width: 'w-full sm:max-w-md' }">
    <div class="p-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6 text-orange-600" />
        </div>
        <h3 class="font-Homenaje text-xl obotoronika-title">
          Request Refund
        </h3>
      </div>

      <p class="obotoronika-muted-text text-sm mb-4">
        You are requesting a refund for order <strong>#{{ item.order_id }}</strong>.
        Our team will review your request.
      </p>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">
          Reason for refund <span class="text-red-500">*</span>
        </label>
        <USelect
          v-model="refundReason"
          :options="[
            { value: '', label: 'Select a reason' },
            { value: 'product_damaged', label: 'Product arrived damaged' },
            { value: 'wrong_item', label: 'Received wrong item' },
            { value: 'not_as_described', label: 'Product not as described' },
            { value: 'quality_issue', label: 'Quality not as expected' },
            { value: 'changed_mind', label: 'Changed my mind' },
            { value: 'other', label: 'Other reason' },
          ]"
          value-attribute="value"
          option-attribute="label"
          placeholder="Select a reason"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">
          Additional details (optional)
        </label>
        <UTextarea
          v-model="refundMessage"
          placeholder="Provide any additional information about your refund request..."
          :rows="3"
        />
      </div>

      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
        <p class="text-sm text-blue-700 dark:text-blue-400">
          <UIcon name="i-heroicons-information-circle" class="w-4 h-4 inline mr-1" />
          Refund will be processed to your original payment method after approval.
        </p>
      </div>

      <div class="flex justify-end gap-3">
        <UButton
          label="Cancel"
          color="gray"
          variant="soft"
          @click="isOpenRefundModal = false"
        />
        <UButton
          label="Submit Request"
          color="orange"
          :loading="isSubmittingRefund"
          :disabled="!refundReason"
          @click="handleSubmitRefund"
        />
      </div>
    </div>
  </UModal>
</template>
