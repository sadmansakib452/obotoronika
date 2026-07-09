<!-- eslint-disable @typescript-eslint/no-explicit-any -->
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
  { label: 'Refunds', icon: 'i-heroicons-currency-dollar' },
]

// Type filter — read from URL query
const route = useRoute()
const typeFilter = ref((route.query.type as string) || '')
const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'cancellation', label: 'Cancellations' },
  { value: 'return', label: 'Returns' },
]

// Table columns configuration
const columns = [
  { key: 'refund_id', label: 'Refund ID' },
  { key: 'order_id', label: 'Order ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'amount', label: 'Amount' },
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
const isOpenDetailsModal = ref(false)
const isOpenActionModal = ref(false)
const selectedRefundId = ref<number | null>(null)
const selectedRefundData = ref<any>(null)
const actionType = ref<'approve' | 'reject' | null>(null)
const adminNote = ref('')
const isSubmitting = ref(false)

// Toast notification
const toast = useToast()

// Get store
const store = useFinanceStore()

// Computed: Get items for current page (switches between refunds and cancellations)
const refunds = computed(() => {
  const { page, perPage } = typeFilter.value === 'cancellation' ? store.cancellations.pagination : store.refunds.pagination
  if (typeFilter.value === 'cancellation') {
    const key = store.getCancellationPageKey(page, perPage, store.cancellations.search, store.cancellations.statusFilter || '')
    return store.cancellations.data[key] ?? []
  }
  const key = store.getRefundPageKey(page, perPage, store.refunds.search, store.refunds.statusFilter || '')
  return store.refunds.data[key] ?? []
})

// Badge color helper
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    paid: 'blue',
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

// Active store section based on type filter
const activeStore = computed(() =>
  typeFilter.value === 'cancellation' ? store.cancellations : store.refunds,
)

// Handle page change
const handlePageChange = (page: number) => {
  if (typeFilter.value === 'cancellation') {
    store.setCancellationsPagination(page, store.cancellations.pagination.perPage)
  }
  else {
    store.setRefundsPagination(page, store.refunds.pagination.perPage)
  }
}

// Handle view details
const handleViewDetails = (row: any) => {
  selectedRefundId.value = row.id
  selectedRefundData.value = row
  store.fetchRefundDetails(row.id)
  isOpenDetailsModal.value = true
}

// Open action modal (approve/reject)
const handleOpenActionModal = (row: any, type: 'approve' | 'reject') => {
  selectedRefundId.value = row.id
  selectedRefundData.value = row
  actionType.value = type
  adminNote.value = ''
  isOpenActionModal.value = true
}

// Submit action (approve/reject)
const handleSubmitAction = async () => {
  if (!selectedRefundId.value || !actionType.value) return

  isSubmitting.value = true

  try {
    const result = await store.updateRefundStatus(
      selectedRefundId.value,
      actionType.value === 'approve' ? 'approved' : 'rejected',
      adminNote.value || undefined,
    )

    if (result.success) {
      toast.add({
        title: 'Success',
        description: `Refund ${actionType.value === 'approve' ? 'approved' : 'rejected'} successfully`,
        color: 'green',
        icon: 'i-heroicons-check-circle',
      })
      isOpenActionModal.value = false

      // Refresh the list
      await store.fetchRefunds(true)
    }
    else {
      toast.add({
        title: 'Error',
        description: result.message || 'Failed to update refund status',
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

// Initial fetch — use cancellations if type=cancellation in URL
onMounted(async () => {
  try {
    if (typeFilter.value === 'cancellation') {
      await store.fetchCancellations()
    }
    else {
      await store.fetchRefunds()
    }
  }
  catch (err) {
    console.error('Failed to fetch data:', err)
  }
})

// Watch search with debounce
watchDebounced(
  search,
  async (val) => {
    if (typeFilter.value === 'cancellation') {
      store.cancellations.search = val
      store.setCancellationsPagination(1, store.cancellations.pagination.perPage, true)
    }
    else {
      store.refunds.search = val
      store.setRefundsPagination(1, store.refunds.pagination.perPage, true)
    }
  },
  { debounce: 300 },
)

// Watch type filter — switch API based on type
watch(typeFilter, async (val) => {
  const type = val || null
  store.refunds.typeFilter = type
  activeStore.pagination.page = 1

  if (type === 'cancellation') {
    await store.fetchCancellations(true)
  }
  else {
    await store.fetchRefunds(true)
  }
})

// Watch status filter
watch(statusFilter, async (val) => {
  if (typeFilter.value === 'cancellation') {
    store.cancellations.statusFilter = val || null
    store.setCancellationsPagination(1, store.cancellations.pagination.perPage, true)
  }
  else {
    store.refunds.statusFilter = val || null
    store.setRefundsPagination(1, store.refunds.pagination.perPage, true)
  }
})

// Page meta
useHead({
  title: 'Refunds | Obotoronika',
})
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex justify-between">
      <UBreadcrumb title="Refunds" :links="links" />
    </div>

    <!-- Toolbar -->
    <Toolbar>
      <template #left>
        <UTooltip text="Refresh">
          <UButton
            label=""
            color="gray"
            :trailing-icon="activeStore.isLoading ? undefined : 'i-heroicons-arrow-path'"
            :loading="activeStore.isLoading"
            ui:loading-icon="i-heroicons-arrow-path animate-spin"
            size="md"
            @click="typeFilter === 'cancellation' ? store.fetchCancellations(true) : store.fetchRefunds(true)"
          />
        </UTooltip>
        <UInput
          v-model="search"
          placeholder="Search by refund ID, order, customer..."
          size="md"
          class="w-64"
        />
      </template>
      <template #right>
        <USelect
          v-model="typeFilter"
          :options="typeOptions"
          value-attribute="value"
          option-attribute="label"
          placeholder="Filter by type"
          class="w-40"
          size="md"
        />
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
      :rows="refunds"
      :columns="columns"
      :loading="activeStore.isLoading"
      class="mt-4"
    >
      <!-- Refund ID column -->
      <template #refund_id-data="{ row }">
        <span class="font-medium text-primary-500">
          {{ row.refund_id || 'N/A' }}
        </span>
      </template>

      <!-- Order ID column -->
      <template #order_id-data="{ row }">
        <span class="font-mono text-sm">
          {{ row.order_id || 'N/A' }}
        </span>
      </template>

      <!-- Customer column -->
      <template #customer-data="{ row }">
        <div class="flex items-center gap-2">
          <UAvatar
            :alt="row.customer_name || 'Customer'"
            size="sm"
          />
          <div class="flex flex-col">
            <span class="text-sm font-medium">
              {{ row.customer_name || 'Unknown' }}
            </span>
            <span class="text-xs text-gray-500">
              {{ row.customer_email || row.customer_phone || 'No contact' }}
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
          <UButton
            label="View"
            color="white"
            size="sm"
            @click="handleViewDetails(row)"
          />
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
            name="i-heroicons-currency-dollar"
            class="w-12 h-12 text-gray-400 mb-3"
          />
          <p class="text-gray-500">No refund requests found</p>
        </div>
      </template>
    </UTable>

    <!-- Pagination -->
    <div class="flex justify-end px-3 py-3.5">
      <UPagination
        v-model="activeStore.pagination.page"
        :page-count="activeStore.pagination.perPage"
        :total="activeStore.pagination.total"
        @update:model-value="handlePageChange"
      />
    </div>

    <!-- ==================== DETAILS MODAL ==================== -->
    <UModal
      v-model="isOpenDetailsModal"
      :ui="{ width: 'w-full sm:max-w-3xl', container: 'items-center' }"
    >
      <div v-if="store.refunds.details" class="p-6">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h3 class="text-xl font-semibold obotoronika-text-color">
                {{ store.refunds.details.refund_id }}
              </h3>
              <UBadge
                :label="store.refunds.details.status?.toUpperCase() || 'PENDING'"
                :color="getStatusColor(store.refunds.details.status)"
                variant="solid"
                size="md"
              />
            </div>
            <p class="text-sm text-gray-500">Order {{ store.refunds.details.order_id }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold obotoronika-text-color">
              {{ formatAmount(store.refunds.details.amount) }}
            </p>
            <p v-if="store.refunds.details.payment_method" class="text-xs text-gray-400">
              via {{ store.refunds.details.payment_method }}
            </p>
          </div>
          <button
            class="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            @click="isOpenDetailsModal = false"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Order & Payment Card -->
        <div class="border obotoronika-border-color rounded-lg p-4 mb-4">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
            <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
            Order &amp; Payment
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-gray-400 text-xs">Order ID</p>
              <p class="font-mono text-xs mt-0.5">{{ store.refunds.details.order_id }}</p>
            </div>
            <div>
              <p class="text-gray-400 text-xs">Invoice</p>
              <p class="font-mono text-xs mt-0.5">{{ store.refunds.details.invoice_id || '-' }}</p>
            </div>
            <div>
              <p class="text-gray-400 text-xs">Transaction</p>
              <p class="font-mono text-xs mt-0.5">{{ store.refunds.details.original_transaction_id || '-' }}</p>
            </div>
            <div>
              <p class="text-gray-400 text-xs">Invoice Total</p>
              <p class="font-medium mt-0.5">{{ store.refunds.details.invoice_total ? formatAmount(store.refunds.details.invoice_total) : '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Customer Info Card -->
        <div class="border obotoronika-border-color rounded-lg p-4 mb-4">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
            <UIcon name="i-heroicons-user" class="w-4 h-4" />
            Customer Information
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div class="space-y-2">
                <div>
                  <p class="text-gray-400 text-xs">Name</p>
                  <p class="font-medium mt-0.5">{{ store.refunds.details.customer_name || '-' }}</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs">Email</p>
                  <p class="mt-0.5">{{ store.refunds.details.customer_email || '-' }}</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs">Phone</p>
                  <p class="mt-0.5">{{ store.refunds.details.customer_phone || '-' }}</p>
                </div>
              </div>
            </div>
            <div v-if="store.refunds.details.customer_address">
              <p class="text-gray-400 text-xs mb-1.5">Shipping Address</p>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-sm space-y-1">
                <p class="font-medium">{{ store.refunds.details.customer_address.name }}</p>
                <p class="text-gray-600 dark:text-gray-400">{{ store.refunds.details.customer_address.address }}</p>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ [store.refunds.details.customer_address.city, store.refunds.details.customer_address.region].filter(Boolean).join(', ') }}
                </p>
                <p v-if="store.refunds.details.customer_address.phone" class="text-gray-600 dark:text-gray-400">
                  Phone: {{ store.refunds.details.customer_address.phone }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Refund Details Card -->
        <div class="border obotoronika-border-color rounded-lg p-4 mb-4">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
            <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4" />
            Refund Details
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-400 text-xs">Reason</p>
              <p class="mt-0.5">{{ store.refunds.details.reason || 'No reason provided' }}</p>
            </div>
            <div v-if="store.refunds.details.admin_note">
              <p class="text-gray-400 text-xs">Admin Note</p>
              <p class="mt-0.5">{{ store.refunds.details.admin_note }}</p>
            </div>
            <div v-if="store.refunds.details.refund_ref_id">
              <p class="text-gray-400 text-xs">Gateway Refund ID</p>
              <p class="font-mono text-xs mt-0.5">{{ store.refunds.details.refund_ref_id }}</p>
            </div>
            <div>
              <p class="text-gray-400 text-xs">Created</p>
              <p class="mt-0.5">{{ store.refunds.details.created_at ? format(parseISO(store.refunds.details.created_at), 'MMM d, yyyy, h:mm a') : '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Timeline Card -->
        <div class="border obotoronika-border-color rounded-lg p-4 mb-4">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
            <UIcon name="i-heroicons-clock" class="w-4 h-4" />
            Timeline
          </h4>
          <div class="relative">
            <div class="absolute left-3.5 top-1 bottom-1 w-px bg-gray-200 dark:bg-gray-700" />

            <!-- Created -->
            <div class="relative flex items-start gap-3 pb-4">
              <div class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 z-10">
                <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div class="flex-1 min-w-0 pt-0.5">
                <p class="text-sm font-medium">Request Created</p>
                <p class="text-xs text-gray-400">
                  {{ store.refunds.details.created_at ? format(parseISO(store.refunds.details.created_at), 'MMM d, yyyy, h:mm a') : '-' }}
                </p>
              </div>
            </div>

            <!-- Approved / Rejected -->
            <div
              v-if="store.refunds.details.status === 'approved' || store.refunds.details.status === 'rejected'"
              class="relative flex items-start gap-3 pb-4"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                :class="store.refunds.details.status === 'approved' ? 'bg-green-100' : 'bg-red-100'"
              >
                <UIcon
                  :name="store.refunds.details.status === 'approved' ? 'i-heroicons-check' : 'i-heroicons-x-mark'"
                  class="w-3.5 h-3.5"
                  :class="store.refunds.details.status === 'approved' ? 'text-green-600' : 'text-red-600'"
                />
              </div>
              <div class="flex-1 min-w-0 pt-0.5">
                <p class="text-sm font-medium capitalize">{{ store.refunds.details.status }}</p>
                <p v-if="store.refunds.details.processed_by_name" class="text-xs text-gray-400">
                  by {{ store.refunds.details.processed_by_name }}
                </p>
                <p v-if="store.refunds.details.updated_at" class="text-xs text-gray-400">
                  {{ format(parseISO(store.refunds.details.updated_at), 'MMM d, yyyy, h:mm a') }}
                </p>
                <p v-if="store.refunds.details.admin_note" class="text-xs text-gray-500 mt-1 italic">
                  "{{ store.refunds.details.admin_note }}"
                </p>
              </div>
            </div>

            <!-- Future: processing / completed (placeholder for when those statuses are used) -->
            <div
              v-if="store.refunds.details.status === 'processing' || store.refunds.details.status === 'completed'"
              class="relative flex items-start gap-3"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                :class="store.refunds.details.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'"
              >
                <UIcon
                  :name="store.refunds.details.status === 'completed' ? 'i-heroicons-check-circle' : 'i-heroicons-arrow-path'"
                  class="w-3.5 h-3.5"
                  :class="store.refunds.details.status === 'completed' ? 'text-green-600' : 'text-blue-600'"
                />
              </div>
              <div class="flex-1 min-w-0 pt-0.5">
                <p class="text-sm font-medium capitalize">{{ store.refunds.details.status }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons (only for pending) -->
        <div v-if="canTakeAction(store.refunds.details.status)" class="flex justify-end gap-3 pt-2">
          <UButton
            label="Reject"
            color="red"
            variant="soft"
            icon="i-heroicons-x-mark"
            size="md"
            @click="handleOpenActionModal(store.refunds.details, 'reject')"
          />
          <UButton
            label="Approve"
            color="green"
            icon="i-heroicons-check"
            size="md"
            @click="handleOpenActionModal(store.refunds.details, 'approve')"
          />
        </div>
      </div>
      <div v-else class="p-8 text-center">
        <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p class="mt-2 text-gray-500">Loading details...</p>
      </div>
    </UModal>

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
            {{ actionType === 'approve' ? 'Approve Refund' : 'Reject Refund' }}
          </h3>
        </div>

        <!-- Refund Info Summary -->
        <div v-if="selectedRefundData" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Refund ID:</span>
            <span class="font-medium">{{ selectedRefundData.refund_id }}</span>
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-500">Amount:</span>
            <span class="font-semibold">{{ formatAmount(selectedRefundData.amount) }}</span>
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

        <!-- Warning for reject -->
        <div v-if="actionType === 'reject'" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <p class="text-sm text-red-600 dark:text-red-400">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 inline mr-1" />
            Rejecting this refund will notify the customer. This action cannot be undone.
          </p>
        </div>

        <!-- Success for approve -->
        <div v-if="actionType === 'approve'" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
          <p class="text-sm text-green-600 dark:text-green-400">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4 inline mr-1" />
            Approving will trigger refund process via payment gateway.
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
            :label="actionType === 'approve' ? 'Approve Refund' : 'Reject Refund'"
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