<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { format } from 'date-fns'
import { Package, Clock, CheckCircle, XCircle, RotateCcw, AlertTriangle, Truck } from 'lucide-vue-next'
import { UBadge, UBreadcrumb, UButton, UCard, UIcon, UModal, UTextarea } from '#components'

const route = useRoute()
const router = useRouter()
const returnId = route.params.id

// State
const returnRequest = ref<any>(null)
const isLoading = ref(true)
const isProcessing = ref(false)
const showRejectModal = ref(false)
const rejectReason = ref('')

// Status colors
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    received: 'blue',
    processing: 'indigo',
    completed: 'teal',
    failed: 'gray',
    withdrawn: 'orange',
  }
  return colors[status] || 'gray'
}

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'MMM d, yyyy, h:mm a')
}

// Fetch return details
const fetchReturnDetails = async () => {
  isLoading.value = true
  try {
    const response = await $fetch(`/api/dashboard/returns/${returnId}`)
    if (response.success) {
      returnRequest.value = response.data.return_request
    }
  }
  catch (error: any) {
    console.error('Failed to fetch return details:', error)
    useToast().add({
      title: 'Error',
      description: error.message || 'Failed to fetch return details',
      color: 'red',
    })
  }
  finally {
    isLoading.value = false
  }
}

// Approve return
const handleApprove = async () => {
  isProcessing.value = true
  try {
    const response = await $fetch(`/api/dashboard/returns/${returnId}/approve`, {
      method: 'POST',
    })
    if (response.success) {
      useToast().add({
        title: 'Success',
        description: 'Return request approved',
        color: 'green',
      })
      await fetchReturnDetails()
    }
  }
  catch (error: any) {
    useToast().add({
      title: 'Error',
      description: error.message || 'Failed to approve return',
      color: 'red',
    })
  }
  finally {
    isProcessing.value = false
  }
}

// Reject return
const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    useToast().add({
      title: 'Error',
      description: 'Please provide a reason for rejection',
      color: 'red',
    })
    return
  }
  isProcessing.value = true
  try {
    const response = await $fetch(`/api/dashboard/returns/${returnId}/reject`, {
      method: 'POST',
      body: { reason: rejectReason.value },
    })
    if (response.success) {
      useToast().add({
        title: 'Success',
        description: 'Return request rejected',
        color: 'green',
      })
      showRejectModal.value = false
      await fetchReturnDetails()
    }
  }
  catch (error: any) {
    useToast().add({
      title: 'Error',
      description: error.message || 'Failed to reject return',
      color: 'red',
    })
  }
  finally {
    isProcessing.value = false
  }
}

// Mark as received
const handleMarkReceived = async () => {
  isProcessing.value = true
  try {
    const response = await $fetch(`/api/dashboard/returns/${returnId}/mark-received`, {
      method: 'POST',
    })
    if (response.success) {
      useToast().add({
        title: 'Success',
        description: 'Return marked as received',
        color: 'green',
      })
      await fetchReturnDetails()
    }
  }
  catch (error: any) {
    useToast().add({
      title: 'Error',
      description: error.message || 'Failed to mark as received',
      color: 'red',
    })
  }
  finally {
    isProcessing.value = false
  }
}

// Process refund
const handleProcessRefund = async () => {
  isProcessing.value = true
  try {
    const response = await $fetch(`/api/refunds/${returnId}/process`, {
      method: 'POST',
    })
    if (response.success) {
      useToast().add({
        title: 'Success',
        description: 'Refund processing initiated',
        color: 'green',
      })
      await fetchReturnDetails()
    }
  }
  catch (error: any) {
    useToast().add({
      title: 'Error',
      description: error.message || 'Failed to process refund',
      color: 'red',
    })
  }
  finally {
    isProcessing.value = false
  }
}

// Initial fetch
onMounted(() => {
  fetchReturnDetails()
})

// Breadcrumb links
const links = [
  {
    label: 'Finance',
    icon: 'solar:wallet-outline',
    to: '/dashboard/finance',
  },
  {
    label: 'Refunds',
    to: '/dashboard/finance/refunds',
  },
  { label: 'Details' },
]

useHead({
  title: 'Return Details | Obotoronika',
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <UBreadcrumb title="Return Details" :links="links" />
      <UButton
        variant="outline"
        color="gray"
        icon="i-heroicons-arrow-left"
        @click="router.push('/dashboard/finance/refunds')"
      >
        Back to Refunds
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8 text-primary" />
    </div>

    <!-- Content -->
    <div v-else-if="returnRequest" class="space-y-6">
      <!-- Header Card -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border p-6">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-semibold">
              Return Request #{{ returnRequest.id }}
            </h2>
            <p class="text-gray-500 mt-1">
              Order #{{ returnRequest.order_id }}
            </p>
          </div>
          <UBadge :color="getStatusColor(returnRequest.status)" variant="subtle" size="lg">
            {{ returnRequest.status }}
          </UBadge>
        </div>
      </div>

      <!-- Status Flow -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border p-6">
        <h3 class="font-semibold mb-4">Status Flow</h3>
        <div class="flex items-center gap-2 flex-wrap">
          <template v-for="(status, index) in ['pending', 'approved', 'received', 'processing', 'completed']" :key="status">
            <div
              :class="[
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
                returnRequest.status === status
                  ? 'bg-primary/10 text-primary'
                  : ['pending', 'approved', 'received', 'processing', 'completed'].indexOf(returnRequest.status) > index
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500',
              ]"
            >
              <component :is="['pending', 'approved', 'received', 'processing', 'completed'][index] === 'completed' ? CheckCircle : ['pending', 'approved', 'received', 'processing', 'completed'][index] === 'received' ? Truck : ['pending', 'approved', 'received', 'processing', 'completed'][index] === 'processing' ? RotateCcw : Clock" :size="14" />
              <span class="capitalize">{{ status }}</span>
            </div>
            <Icon
              v-if="index < 4"
              name="i-heroicons-chevron-right"
              class="text-gray-400"
            />
          </template>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Request Details -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border p-6">
          <h3 class="font-semibold mb-4">Request Details</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-500">Type</span>
              <span class="font-medium capitalize">{{ returnRequest.type }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Reason</span>
              <span class="font-medium">{{ returnRequest.reason }}</span>
            </div>
            <div v-if="returnRequest.description" class="flex justify-between">
              <span class="text-gray-500">Description</span>
              <span class="font-medium">{{ returnRequest.description }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Refund Amount</span>
              <span class="font-medium text-lg">৳{{ returnRequest.refund_amount || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Refund Method</span>
              <span class="font-medium capitalize">{{ returnRequest.method }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Created</span>
              <span class="font-medium">{{ formatDate(returnRequest.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Admin Notes -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border p-6">
          <h3 class="font-semibold mb-4">Admin Information</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-500">Status</span>
              <UBadge :color="getStatusColor(returnRequest.status)" variant="subtle">
                {{ returnRequest.status }}
              </UBadge>
            </div>
            <div v-if="returnRequest.admin_notes" class="flex justify-between">
              <span class="text-gray-500">Notes</span>
              <span class="font-medium">{{ returnRequest.admin_notes }}</span>
            </div>
            <div v-if="returnRequest.processed_by" class="flex justify-between">
              <span class="text-gray-500">Processed By</span>
              <span class="font-medium">{{ returnRequest.processed_by }}</span>
            </div>
            <div v-if="returnRequest.processed_at" class="flex justify-between">
              <span class="text-gray-500">Processed At</span>
              <span class="font-medium">{{ formatDate(returnRequest.processed_at) }}</span>
            </div>
            <div v-if="returnRequest.refund_ref_id" class="flex justify-between">
              <span class="text-gray-500">Refund Ref ID</span>
              <span class="font-medium">{{ returnRequest.refund_ref_id }}</span>
            </div>
            <div v-if="returnRequest.updated_at" class="flex justify-between">
              <span class="text-gray-500">Last Updated</span>
              <span class="font-medium">{{ formatDate(returnRequest.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border p-6">
        <h3 class="font-semibold mb-4">Actions</h3>
        <div class="flex flex-wrap gap-3">
          <!-- Pending Actions -->
          <template v-if="returnRequest.status === 'pending'">
            <UButton
              color="green"
              icon="i-heroicons-check"
              :loading="isProcessing"
              @click="handleApprove"
            >
              Approve Return
            </UButton>
            <UButton
              color="red"
              variant="outline"
              icon="i-heroicons-x-mark"
              :loading="isProcessing"
              @click="showRejectModal = true"
            >
              Reject Return
            </UButton>
          </template>

          <!-- Approved Actions -->
          <template v-if="returnRequest.status === 'approved'">
            <UButton
              color="blue"
              icon="i-heroicons-inbox"
              :loading="isProcessing"
              @click="handleMarkReceived"
            >
              Mark as Received
            </UButton>
          </template>

          <!-- Received Actions -->
          <template v-if="returnRequest.status === 'received'">
            <UButton
              color="indigo"
              icon="i-heroicons-currency-dollar"
              :loading="isProcessing"
              @click="handleProcessRefund"
            >
              Process Refund
            </UButton>
          </template>

          <!-- Processing/Completed - Show status -->
          <template v-if="['processing', 'completed'].includes(returnRequest.status)">
            <UBadge color="green" size="lg">
              Refund {{ returnRequest.status }}
            </UBadge>
          </template>

          <!-- Rejected/Withdrawn -->
          <template v-if="['rejected', 'withdrawn'].includes(returnRequest.status)">
            <UBadge color="gray" size="lg">
              {{ returnRequest.status }}
            </UBadge>
          </template>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-12">
      <AlertTriangle :size="48" class="mx-auto mb-4 text-yellow-500" />
      <h3 class="text-lg font-semibold mb-2">Return Not Found</h3>
      <UButton variant="outline" @click="router.push('/dashboard/finance/refunds')">
        Back to Refunds
      </UButton>
    </div>

    <!-- Reject Modal -->
    <UModal v-model="showRejectModal" :close="true">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Reject Return Request</h3>
        </template>

        <div class="space-y-4">
          <p class="text-gray-500">
            Please provide a reason for rejecting this return request.
          </p>
          <UTextarea
            v-model="rejectReason"
            placeholder="Enter rejection reason..."
            rows="4"
          />
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              variant="outline"
              color="gray"
              @click="showRejectModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="red"
              :loading="isProcessing"
              @click="handleReject"
            >
              Reject
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>