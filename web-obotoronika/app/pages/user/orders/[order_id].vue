<script lang="ts" setup>
import { format, parseISO } from 'date-fns'
import { ArrowLeft } from 'lucide-vue-next'
import { useOrderStatusStyles } from '@/composables/useOrderStatusStyles'
import { UBadge, UButton, UIcon, UModal, USelect, UTextarea } from '#components'

definePageMeta({
  roles: ['customer', 'super_admin'],
})

const route = useRoute()
const config = useRuntimeConfig()
const orderId = route.params.order_id as string
const toast = useToast()

// Fetch order data
const { data: orderData, error, pending, refresh } = await useFetch(`/api/orders/${orderId}`, {
  key: `order-${orderId}`,
})

const order = computed(() => orderData.value?.data?.order ?? null)

// Fetch refund status separately
const { data: refundData, pending: refundPending, refresh: refreshRefund } = await useFetch(
  () => `/api/orders/${orderId}/refund-status`,
  {
    key: `refund-status-${orderId}`,
    transform: (data: any) => data?.data || null,
  },
)

const refundStatus = computed(() => refundData.value)

const { getOrderStatusClasses } = useOrderStatusStyles()
const statusClasses = (status: string) => getOrderStatusClasses(status)

const stepOrder = ['confirmed', 'processing', 'shipped', 'delivered']
const isStepComplete = (step: string, orderStatus: string) => {
  if (orderStatus === 'cancelled' || orderStatus === 'canceled') return false
  const stepIdx = stepOrder.indexOf(step)
  const statusIdx = stepOrder.indexOf(orderStatus)
  return stepIdx < statusIdx
}
const isStepActive = (step: string, orderStatus: string) => {
  if (orderStatus === 'cancelled' || orderStatus === 'canceled') return false
  return step === orderStatus
}

// Refund modal state
const isOpenRefundModal = ref(false)
const refundReason = ref('')
const refundMessage = ref('')
const isSubmittingRefund = ref(false)

// Get badge color for refund status
const getRefundStatusColor = (status: string | null): string => {
  const map: Record<string, string> = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
  }
  return map[status || ''] || 'gray'
}

// Check if can request refund
const canRequestRefund = computed(() => {
  return order.value?.status === 'delivered' &&
    !refundStatus.value?.has_refund_request
})

// Handle submit refund request
const handleSubmitRefund = async () => {
  if (isSubmittingRefund.value || !refundReason.value) return

  isSubmittingRefund.value = true

  try {
    const response = await fetch(`/api/orders/${orderId}/refund`, {
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

      // Refresh refund status
      await refreshRefund()
      isOpenRefundModal.value = false
      refundReason.value = ''
      refundMessage.value = ''
    }
    else {
      toast.add({
        title: 'Request Failed',
        description: result.message || 'Could not submit refund request.',
        color: 'red',
        icon: 'i-heroicons-exclamation-circle',
      })
    }
  }
  catch (error: any) {
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred.',
      color: 'red',
      icon: 'i-heroicons-exclamation-circle',
    })
  }
  finally {
    isSubmittingRefund.value = false
  }
}

// Open refund modal
const openRefundModal = () => {
  refundReason.value = ''
  refundMessage.value = ''
  isOpenRefundModal.value = true
}

useHead({
  title: order.value ? `Order #${order.value.order_id} | Obotoronika` : 'Order Details | Obotoronika',
})
</script>

<template>
  <div class="my-8 w-11/12 mx-auto lg:w-10/12 lg:ml-4">
    <NuxtLink
      to="/user/orders"
      class="inline-flex items-center gap-2 obotoronika-muted-text text-sm hover:opacity-80 mb-6"
    >
      <ArrowLeft :size="18" />
      Back to orders
    </NuxtLink>

    <div v-if="pending" class="py-12 text-center obotoronika-muted-text">
      Loading order...
    </div>

    <template v-else-if="error || !order">
      <div class="py-12 text-center">
        <p class="obotoronika-title font-medium text-lg">
          Order not found
        </p>
        <p class="obotoronika-muted-text text-sm mt-1">
          This order may not exist or you don't have access to it.
        </p>
        <NuxtLink to="/user/orders">
          <UButton class="mt-4" color="primary" label="View all orders" />
        </NuxtLink>
      </div>
    </template>

    <template v-else>
      <div class="flex flex-col gap-6">
        <!-- Order header -->
        <div class="flex flex-wrap justify-between items-start gap-4 border obotoronika-border-color rounded-lg p-4">
          <div>
            <h1 class="font-Homenaje text-2xl obotoronika-title">
              Order #{{ order.order_id }}
            </h1>
            <p class="obotoronika-muted-text text-sm mt-1">
              Placed on
              {{
                format(
                  parseISO(order.created_at),
                  'MMMM d, yyyy \'at\' h:mm a',
                )
              }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span
              :class="['font-medium text-sm capitalize px-3 py-1.5 rounded-full', statusClasses(order.status)]"
            >
              {{ order.status }}
            </span>
            <!-- Refund Status Badge -->
            <div v-if="refundStatus?.has_refund_request && !refundPending">
              <UBadge
                :label="`Refund: ${refundStatus.refund_status}`"
                :color="getRefundStatusColor(refundStatus.refund_status)"
                variant="solid"
                size="sm"
              />
            </div>
          </div>
        </div>

        <!-- Order Progress Tracker -->
        <div class="border obotoronika-border-color rounded-lg p-4 lg:p-6">
          <h3 class="text-sm font-semibold obotoronika-title mb-4">Order Progress</h3>
          <div class="flex items-center justify-between">
            <template v-for="(step, sIdx) in ['confirmed', 'processing', 'shipped', 'delivered']" :key="step">
              <div class="flex flex-col items-center flex-1">
                <div
                  :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors', isStepComplete(step, order.status) ? 'bg-[#FC6A03] text-white' : isStepActive(step, order.status) ? 'bg-orange-100 dark:bg-orange-900/30 text-[#FC6A03] border-2 border-[#FC6A03]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400']"
                >
                  <span v-if="isStepComplete(step, order.status)">✓</span>
                  <span v-else>{{ sIdx + 1 }}</span>
                </div>
                <span class="text-xs mt-1 text-center capitalize obotoronika-muted-text">{{ step }}</span>
              </div>
              <div
                v-if="sIdx < 3"
                :class="['flex-1 h-0.5 mx-1 transition-colors', isStepComplete(step, order.status) ? 'bg-[#FC6A03]' : 'bg-gray-200 dark:bg-gray-700']"
              />
            </template>
          </div>
          <!-- Cancelled / Refunded overlay -->
          <div v-if="order.status === 'cancelled' || order.status === 'canceled' || order.status === 'refunded'" class="mt-4 text-center">
            <span :class="['inline-block text-xs font-medium px-3 py-1 rounded-full', order.status === 'refunded' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400']">
              {{ order.status === 'refunded' ? 'Order Refunded' : 'Order Cancelled' }}
            </span>
          </div>
        </div>

        <!-- Refund Status Section (if has refund request) -->
        <div
          v-if="refundStatus?.has_refund_request && !refundPending"
          class="border rounded-lg p-4"
          :class="refundStatus.refund_status === 'approved' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : refundStatus.refund_status === 'rejected' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold obotoronika-title text-sm">
                Refund Request Details
              </h3>
              <p class="text-sm obotoronika-muted-text mt-1">
                Refund ID: <span class="font-mono">{{ refundStatus.refund_id }}</span>
              </p>
              <p v-if="refundStatus.refund_amount" class="text-sm obotoronika-muted-text">
                Amount: <span class="font-semibold">৳{{ refundStatus.refund_amount }}</span>
              </p>
            </div>
            <UBadge
              :label="refundStatus.refund_status?.toUpperCase()"
              :color="getRefundStatusColor(refundStatus.refund_status)"
              variant="subtle"
              size="lg"
            />
          </div>
        </div>

        <!-- Request Refund Button -->
        <div v-if="order.status === 'delivered' && !refundPending" class="flex justify-end">
          <UButton
            v-if="canRequestRefund"
            icon="i-heroicons-currency-dollar"
            color="orange"
            @click="openRefundModal"
          >
            Request Refund
          </UButton>
        </div>

        <!-- Order items -->
        <div class="border obotoronika-border-color rounded-lg overflow-hidden">
          <div class="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b obotoronika-border-color grid grid-cols-12 gap-4 font-semibold obotoronika-title text-sm">
            <div class="col-span-6 md:col-span-7">
              Product
            </div>
            <div class="col-span-2 text-center">
              Price
            </div>
            <div class="col-span-2 text-center">
              Qty
            </div>
            <div class="col-span-2 md:col-span-1 text-right">
              Subtotal
            </div>
          </div>
          <div
            v-for="(line, index) in order.items"
            :key="index"
            class="grid grid-cols-12 gap-4 px-4 py-4 border-b obotoronika-border-color last:border-b-0 items-center"
          >
            <div class="col-span-6 md:col-span-7 flex items-center gap-4 min-w-0">
              <img
                v-if="line.product"
                :src="`${config.public.mediaUrl}${line.product.thumbnail}`"
                :alt="line.product.title"
                class="w-14 h-14 object-cover rounded-md border shrink-0"
              >
              <div class="min-w-0">
                <NuxtLink
                  v-if="line.product?.slug"
                  :to="`/products/${line.product.slug}`"
                  class="font-medium obotoronika-title text-sm hover:underline line-clamp-2"
                >
                  {{ line.product?.title ?? 'Product' }}
                </NuxtLink>
                <p v-else class="font-medium obotoronika-title text-sm line-clamp-2">
                  {{ line.product?.title ?? 'Product' }}
                </p>
              </div>
            </div>
            <div class="col-span-2 text-center obotoronika-text-color text-sm">
              ৳{{ line.price?.toFixed(2) }}
            </div>
            <div class="col-span-2 text-center obotoronika-text-color text-sm">
              {{ line.quantity }}
            </div>
            <div class="col-span-2 md:col-span-1 text-right font-medium obotoronika-title text-sm">
              ৳{{ line.subtotal?.toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Shipping address (if present) -->
        <div
          v-if="order.shipping_address && typeof order.shipping_address === 'object'"
          class="border obotoronika-border-color rounded-lg p-4"
        >
          <h2 class="font-semibold obotoronika-title text-sm mb-2">
            Shipping address
          </h2>
          <p class="obotoronika-muted-text text-sm whitespace-pre-line">
            {{ order.shipping_address.address }}
            {{ order.shipping_address.city }}
            {{ order.shipping_address.region }}
            {{ order.shipping_address.postcode }}
          </p>
        </div>
        <div
          v-else-if="order.shipping_address && typeof order.shipping_address === 'string'"
          class="border obotoronika-border-color rounded-lg p-4"
        >
          <h2 class="font-semibold obotoronika-title text-sm mb-2">
            Shipping address
          </h2>
          <p class="obotoronika-muted-text text-sm whitespace-pre-line">
            {{ order.shipping_address }}
          </p>
        </div>

        <!-- Total -->
        <div class="flex justify-end border obotoronika-border-color rounded-lg p-4">
          <div class="text-right">
            <p class="obotoronika-muted-text text-sm">
              Total
            </p>
            <p class="font-semibold obotoronika-title text-xl mt-1">
              ৳{{ order.total_amount?.toFixed(2) }}
            </p>
          </div>
        </div>

        <div class="flex gap-2 justify-end">
          <UButton
            to="/user/orders"
            color="neutral"
            variant="outline"
            label="Back to orders"
          />
          <UButton to="/" color="primary" label="Continue shopping" />
        </div>
      </div>
    </template>

    <!-- Refund Request Modal -->
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
          You are requesting a refund for order <strong>#{{ orderId }}</strong>.
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
            placeholder="Provide any additional information..."
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
  </div>
</template>