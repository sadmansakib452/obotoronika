<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { watchDebounced } from '@vueuse/core'
import { useFinanceStore } from '@/stores/finance'
import { UAvatar, UBadge, UBreadcrumb, UButton, UIcon, UInput, UModal, UPagination, USelect, UTable, UTextarea, UTooltip } from '#components'

// Breadcrumb navigation links
const links = [
  {
    label: 'Finance',
    icon: 'solar:wallet-outline',
    to: '/dashboard/finance',
  },
  { label: 'Cancellations', icon: 'i-heroicons-no-symbol' },
]

// Table columns configuration
const columns = [
  { key: 'refund_id', label: 'Cancellation ID' },
  { key: 'order_id', label: 'Order ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'amount', label: 'Amount' },
  { key: 'payment', label: 'Payment' },
  { key: 'reason', label: 'Reason' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Date' },
  { key: 'actions', label: '' },
]

// Status filter options
const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

// Local state
const search = ref('')
const statusFilter = ref('')

// Modal states
const isOpenActionModal = ref(false)
const selectedCancellationId = ref<number | null>(null)
const selectedCancellationData = ref<any>(null)
const actionType = ref<'approve' | 'reject' | null>(null)
const adminNote = ref('')
const isSubmitting = ref(false)

// Toast notification
const toast = useToast()

// Get store
const store = useFinanceStore()

// Computed: Get cancellations for current page
const cancellations = computed(() => {
  const { page, perPage } = store.cancellations.pagination
  const key = store.getCancellationPageKey(page, perPage, store.cancellations.search, store.cancellations.statusFilter || '')
  return store.cancellations.data[key] ?? []
})

// Badge color helper
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
  }
  return colorMap[status] || 'gray'
}

// Format amount helper
const formatAmount = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(num)
}

// Payment method label
const getPaymentLabel = (method: string | null | undefined): string => {
  if (!method) return '—'
  const labels: Record<string, string> = {
    cod: 'COD',
    card: 'Card',
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
  }
  return labels[method] || method
}

// Handle page change
const handlePageChange = (page: number) => {
  store.setCancellationsPagination(page, store.cancellations.pagination.perPage)
}

// Open action modal (approve/reject)
const handleOpenActionModal = (row: any, type: 'approve' | 'reject') => {
  selectedCancellationId.value = row.id
  selectedCancellationData.value = row
  actionType.value = type
  adminNote.value = ''
  isOpenActionModal.value = true
}

// Submit action (approve/reject)
const handleSubmitAction = async () => {
  if (!selectedCancellationId.value || !actionType.value) return

  isSubmitting.value = true

  try {
    let result: any

    if (actionType.value === 'approve') {
      result = await store.approveCancellation(selectedCancellationId.value)
    }
    else {
      result = await store.rejectCancellation(
        selectedCancellationId.value,
        adminNote.value || undefined,
      )
    }

    if (result.success) {
      toast.add({
        title: 'Success',
        description: `Cancellation request ${actionType.value === 'approve' ? 'approved' : 'rejected'} successfully`,
        color: 'green',
        icon: 'i-heroicons-check-circle',
      })
      isOpenActionModal.value = false

      // Refresh the list
      await store.fetchCancellations(true)
    }
    else {
      toast.add({
        title: 'Error',
        description: result.message || 'Failed to process cancellation request',
        color: 'red',
        icon: 'i-heroicons-exclamation-circle',
      })
    }
  }
  catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'An unexpected error occurred',
      color: 'red',
      icon: 'i-heroicons-exclamation-circle',
    })
  }
  finally {
    isSubmitting.value = false
  }
}

// Check if action is allowed (only pending status)
const canTakeAction = (status: string): boolean => {
  return status === 'pending'
}

// Initial fetch
onMounted(async () => {
  try {
    await store.fetchCancellations()
  }
  catch (err) {
    console.error('Failed to fetch cancellations:', err)
  }
})

// Watch search with debounce
watchDebounced(
  search,
  async (val) => {
    store.cancellations.search = val
    await store.setCancellationsPagination(1, store.cancellations.pagination.perPage, true)
  },
  { debounce: 300 },
)

// Watch status filter
watch(statusFilter, async (val) => {
  store.cancellations.statusFilter = val || null
  await store.setCancellationsPagination(1, store.cancellations.pagination.perPage, true)
})

// Redirect to merged Refunds page with cancellation filter
navigateTo('/dashboard/finance/refunds?type=cancellation', { replace: true })

// Page meta
useHead({
  title: 'Cancellations | Obotoronika',
})
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex justify-between">
      <UBreadcrumb title="Cancellations" :links="links" />
    </div>

    <!-- Toolbar -->
    <Toolbar>
      <template #left>
        <UTooltip text="Refresh">
          <UButton
            label=""
            color="gray"
            :trailing-icon="store.cancellations.isLoading ? undefined : 'i-heroicons-arrow-path'"
            :loading="store.cancellations.isLoading"
            ui:loading-icon="i-heroicons-arrow-path animate-spin"
            size="md"
            @click="store.fetchCancellations(true)"
          />
        </UTooltip>
        <UInput
          v-model="search"
          placeholder="Search by cancellation ID, order..."
          size="md"
          class="w-64"
        />
      </template>
      <template #right>
        <USelect
          v-model="statusFilter"
          :options="statusOptions"
          value-attribute="value"
          option-attribute="label"
          placeholder="Filter by status"
          class="w-40"
          size="md"
        />
      </template>
    </Toolbar>

    <!-- Table -->
    <UTable
      :rows="cancellations"
      :columns="columns"
      :loading="store.cancellations.isLoading"
      class="mt-4"
    >
      <!-- Cancellation ID column -->
      <template #refund_id-data="{ row }">
        <span class="font-medium text-primary-500">
          {{ row.refund_id || 'N/A' }}
        </span>
      </template>

      <!-- Order ID column -->
      <template #order_id-data="{ row }">
        <span class="font-mono text-sm">
          {{ row.order?.order_id || 'N/A' }}
        </span>
      </template>

      <!-- Customer column -->
      <template #customer-data="{ row }">
        <div class="flex items-center gap-2">
          <UAvatar
            :alt="row.customer?.name || 'Customer'"
            size="sm"
          />
          <div class="flex flex-col">
            <span class="text-sm font-medium">
              {{ row.customer?.name || 'Unknown' }}
            </span>
            <span class="text-xs text-gray-500">
              {{ row.customer?.email || row.customer?.phone || 'No contact' }}
            </span>
          </div>
        </div>
      </template>

      <!-- Amount column -->
      <template #amount-data="{ row }">
        <span class="font-semibold">
          {{ formatAmount(row.amount) }}
        </span>
      </template>

      <!-- Payment column -->
      <template #payment-data="{ row }">
        <UBadge
          :label="getPaymentLabel(row.order?.payment_method)"
          :color="row.order?.payment_method === 'cod' ? 'gray' : 'blue'"
          variant="subtle"
          size="xs"
        />
      </template>

      <!-- Reason column -->
      <template #reason-data="{ row }">
        <span class="line-clamp-1" :title="row.reason || 'No reason'">
          {{ row.reason || '-' }}
        </span>
      </template>

      <!-- Status column -->
      <template #status-data="{ row }">
        <UBadge
          :label="(row.status || 'pending').toUpperCase()"
          :color="getStatusColor(row.status)"
          variant="subtle"
          class="capitalize"
        />
      </template>

      <!-- Date column -->
      <template #date-data="{ row }">
        <span v-if="row.created_at">
          {{ format(parseISO(row.created_at), 'MMM d, yyyy').toUpperCase() }}
        </span>
        <span v-else class="text-gray-400">-</span>
      </template>

      <!-- Actions column -->
      <template #actions-data="{ row }">
        <div class="flex items-center gap-2">
          <!-- Approve button - only show for pending -->
          <UButton
            v-if="canTakeAction(row.status)"
            label="Approve"
            color="green"
            variant="soft"
            size="sm"
            icon="i-heroicons-check"
            @click="handleOpenActionModal(row, 'approve')"
          />
          <!-- Reject button - only show for pending -->
          <UButton
            v-if="canTakeAction(row.status)"
            label="Reject"
            color="red"
            variant="soft"
            size="sm"
            icon="i-heroicons-x-mark"
            @click="handleOpenActionModal(row, 'reject')"
          />
        </div>
      </template>

      <!-- Empty state -->
      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-12">
          <UIcon
            name="i-heroicons-no-symbol"
            class="w-12 h-12 text-gray-400 mb-3"
          />
          <p class="text-gray-500">No cancellation requests found</p>
        </div>
      </template>
    </UTable>

    <!-- Pagination -->
    <div class="flex justify-end px-3 py-3.5">
      <UPagination
        v-model="store.cancellations.pagination.page"
        :page-count="store.cancellations.pagination.perPage"
        :total="store.cancellations.pagination.total"
        @update:model-value="handlePageChange"
      />
    </div>

    <!-- ==================== ACTION CONFIRMATION MODAL ==================== -->
    <UModal
      v-model="isOpenActionModal"
      :ui="{ width: 'w-full sm:max-w-md', container: 'items-center' }"
    >
      <div class="p-4">
        <!-- Modal Header -->
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :class="actionType === 'approve' ? 'bg-green-100' : 'bg-red-100'"
          >
            <UIcon
              :name="actionType === 'approve' ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'"
              class="w-6 h-6"
              :class="actionType === 'approve' ? 'text-green-600' : 'text-red-600'"
            />
          </div>
          <h3 class="font-Homenaje text-xl obotoronika-title">
            {{ actionType === 'approve' ? 'Approve Cancellation' : 'Reject Cancellation' }}
          </h3>
        </div>

        <!-- Cancellation Info Summary -->
        <div v-if="selectedCancellationData" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Request ID:</span>
            <span class="font-medium">{{ selectedCancellationData.refund_id }}</span>
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-500">Order:</span>
            <span class="font-mono">#{{ selectedCancellationData.order?.order_id }}</span>
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-500">Amount:</span>
            <span class="font-semibold">{{ formatAmount(selectedCancellationData.amount) }}</span>
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-500">Payment:</span>
            <span class="font-medium">{{ getPaymentLabel(selectedCancellationData.order?.payment_method) }}</span>
          </div>
        </div>

        <!-- Admin Note Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">
            Admin Note {{ actionType === 'reject' ? '(Required)' : '(Optional)' }}
          </label>
          <UTextarea
            v-model="adminNote"
            :placeholder="actionType === 'approve' ? 'Add a note (optional)' : 'Reason for rejection (required)'"
            :rows="3"
          />
        </div>

        <!-- Info for approve - COD -->
        <div
          v-if="actionType === 'approve' && selectedCancellationData?.order?.payment_method === 'cod'"
          class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4"
        >
          <p class="text-sm text-blue-600 dark:text-blue-400">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4 inline mr-1" />
            Approving will cancel the order and restore stock. No financial refund needed (COD).
          </p>
        </div>

        <!-- Info for approve - Online payment -->
        <div
          v-if="actionType === 'approve' && selectedCancellationData?.order?.payment_method !== 'cod'"
          class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4"
        >
          <p class="text-sm text-green-600 dark:text-green-400">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4 inline mr-1" />
            Approving will cancel the order, restore stock, and initiate a refund via the payment gateway.
          </p>
        </div>

        <!-- Warning for reject -->
        <div v-if="actionType === 'reject'" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <p class="text-sm text-red-600 dark:text-red-400">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 inline mr-1" />
            Rejecting this cancellation will decline the customer's request. This action cannot be undone.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3">
          <UButton
            label="Cancel"
            color="gray"
            variant="soft"
            @click="isOpenActionModal = false"
          />
          <UButton
            :label="actionType === 'approve' ? 'Approve Cancellation' : 'Reject Cancellation'"
            :color="actionType === 'approve' ? 'green' : 'red'"
            :loading="isSubmitting"
            :disabled="actionType === 'reject' && !adminNote.trim()"
            @click="handleSubmitAction"
          />
        </div>
      </div>
    </UModal>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
