<script lang="ts" setup>
import { Package, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-vue-next'
import { UBadge, UButton, UCard, UModal } from '#components'

definePageMeta({
  roles: ['customer', 'super_admin'],
})

// State
const returnRequests = ref<any[]>([])
const isLoading = ref(true)
const selectedReturn = ref<any>(null)
const showDetailsModal = ref(false)
const showNewReturnModal = ref(false)

// Pagination
const currentPage = ref(1)
const perPage = ref(10)
const totalCount = ref(0)

// Filter state
const statusFilter = ref('')

// Available statuses
const statuses = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

// Fetch return requests
const fetchReturns = async () => {
  isLoading.value = true
  try {
    const params = new URLSearchParams()
    params.append('page', currentPage.value.toString())
    params.append('per_page', perPage.value.toString())
    if (statusFilter.value) {
      params.append('status', statusFilter.value)
    }

    const response = await $fetch(`/api/returns?${params.toString()}`)
    if (response.success) {
      returnRequests.value = response.data.return_requests
      totalCount.value = response.data.meta.total
    }
  }
  catch (error) {
    console.error('Failed to fetch returns:', error)
  }
  finally {
    isLoading.value = false
  }
}

// Watch for filter changes
watch([currentPage, statusFilter], () => {
  fetchReturns()
})

// Initial fetch
onMounted(() => {
  fetchReturns()
})

// Status colors
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    withdrawn: 'gray',
  }
  return colors[status] || 'gray'
}

// Status icons
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return Clock
    case 'approved':
    case 'completed':
      return CheckCircle
    case 'rejected':
    case 'failed':
      return XCircle
    default:
      return RotateCcw
  }
}

// View return details
const viewDetails = (returnItem: any) => {
  selectedReturn.value = returnItem
  showDetailsModal.value = true
}

// Withdraw return request
const isWithdrawing = ref(false)
const handleWithdraw = async () => {
  if (!selectedReturn.value) return

  isWithdrawing.value = true
  try {
    const response = await $fetch(`/api/returns/${selectedReturn.value.id}/withdraw`, {
      method: 'POST',
    })
    if (response.success) {
      useToast().add({
        title: 'Success',
        description: 'Return request withdrawn successfully',
        color: 'green',
      })
      showDetailsModal.value = false
      fetchReturns()
    }
  }
  catch (error: any) {
    useToast().add({
      title: 'Error',
      description: error.message || 'Failed to withdraw return request',
      color: 'red',
    })
  }
  finally {
    isWithdrawing.value = false
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Computed stats
const stats = computed(() => {
  return {
    total: totalCount.value,
    pending: returnRequests.value.filter(r => r.status === 'pending').length,
    processing: returnRequests.value.filter(r => r.status === 'processing').length,
    completed: returnRequests.value.filter(r => r.status === 'completed').length,
  }
})

// Refresh data
const refresh = () => {
  fetchReturns()
}
</script>

<template>
  <div class="my-8 w-11/12 mx-auto lg:w-10/12 lg:ml-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="font-Homenaje text-3xl obotoronika-title">
          My Returns
        </h3>
        <p class="obotoronika-muted-text text-sm">
          View and manage your return requests.
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
      <div class="border obotoronika-border-color rounded-md p-4">
        <div class="obotoronika-muted-text text-sm flex justify-between items-center font-medium">
          <p>Total Returns</p>
          <Package :size="16" />
        </div>
        <p class="font-semibold obotoronika-title text-xl my-2">
          {{ stats.total }}
        </p>
        <p class="obotoronika-muted-text text-sm">
          All return requests
        </p>
      </div>
      <div class="border obotoronika-border-color rounded-md p-4">
        <div class="obotoronika-muted-text text-sm flex justify-between items-center font-medium">
          <p>Pending</p>
          <Clock :size="16" />
        </div>
        <p class="font-semibold obotoronika-title text-xl my-2">
          {{ stats.pending }}
        </p>
        <p class="obotoronika-muted-text text-sm">
          Awaiting admin review
        </p>
      </div>
      <div class="border obotoronika-border-color rounded-md p-4">
        <div class="obotoronika-muted-text text-sm flex justify-between items-center font-medium">
          <p>Completed</p>
          <CheckCircle :size="16" />
        </div>
        <p class="font-semibold obotoronika-title text-xl my-2">
          {{ stats.completed }}
        </p>
        <p class="obotoronika-muted-text text-sm">
          Refunds processed
        </p>
      </div>
    </div>

    <!-- Filter -->
    <div class="mb-4 flex justify-between items-center">
      <h4 class="font-semibold text-lg">
        Return History
      </h4>
      <select
        v-model="statusFilter"
        class="border obotoronika-border-color rounded-md px-3 py-2 bg-transparent mt-2 sm:mt-0"
      >
        <option v-for="status in statuses" :key="status.value" :value="status.value">
          {{ status.label }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="obotoronika-muted-text">
        Loading returns...
      </p>
    </div>

    <!-- Empty State -->
    <div v-else-if="returnRequests.length === 0" class="text-center py-12 border obotoronika-border-color rounded-lg">
      <RotateCcw :size="48" class="mx-auto mb-4 text-gray-400" />
      <h4 class="text-lg font-semibold mb-2">
        No Return Requests
      </h4>
      <p class="obotoronika-muted-text mb-4">
        You haven't made any return requests yet.
      </p>
      <p class="obotoronika-muted-text text-sm">
        Go to your orders to request a return.
      </p>
    </div>

    <!-- Returns List -->
    <div v-else class="space-y-4">
      <div
        v-for="returnItem in returnRequests"
        :key="returnItem.id"
        class="border obotoronika-border-color rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="viewDetails(returnItem)"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-semibold">Order #{{ returnItem.order_id }}</span>
              <UBadge :color="getStatusColor(returnItem.status)" variant="subtle">
                {{ returnItem.status }}
              </UBadge>
            </div>
            <p class="text-sm obotoronika-muted-text mt-1">
              Type: {{ returnItem.type }}
            </p>
            <p class="text-sm mt-2">
              <span class="obotoronika-muted-text">Reason: </span>
              {{ returnItem.reason }}
            </p>
          </div>
          <div class="text-right">
            <p class="font-semibold text-lg">
              ৳{{ returnItem.refund_amount || 0 }}
            </p>
            <p class="text-xs obotoronika-muted-text">
              {{ formatDate(returnItem.created_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalCount > perPage" class="flex justify-center mt-6 gap-2">
      <UButton
        :disabled="currentPage === 1"
        variant="outline"
        size="sm"
        @click="currentPage--"
      >
        Previous
      </UButton>
      <UButton
        :disabled="currentPage * perPage >= totalCount"
        variant="outline"
        size="sm"
        @click="currentPage++"
      >
        Next
      </UButton>
    </div>

    <!-- Return Details Modal -->
    <UModal v-model="showDetailsModal" :close="true">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h4 class="text-lg font-semibold">
              Return Request Details
            </h4>
            <UButton variant="ghost" size="sm" @click="showDetailsModal = false" />
          </div>
        </template>

        <div v-if="selectedReturn" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm obotoronika-muted-text">
                Return ID
              </p>
              <p class="font-medium">
                #{{ selectedReturn.id }}
              </p>
            </div>
            <div>
              <p class="text-sm obotoronika-muted-text">
                Order ID
              </p>
              <p class="font-medium">
                #{{ selectedReturn.order_id }}
              </p>
            </div>
            <div>
              <p class="text-sm obotoronika-muted-text">
                Type
              </p>
              <p class="font-medium capitalize">
                {{ selectedReturn.type }}
              </p>
            </div>
            <div>
              <p class="text-sm obotoronika-muted-text">
                Status
              </p>
              <UBadge :color="getStatusColor(selectedReturn.status)" variant="subtle">
                {{ selectedReturn.status }}
              </UBadge>
            </div>
            <div>
              <p class="text-sm obotoronika-muted-text">
                Refund Amount
              </p>
              <p class="font-medium">
                ৳{{ selectedReturn.refund_amount || 0 }}
              </p>
            </div>
            <div>
              <p class="text-sm obotoronika-muted-text">
                Created
              </p>
              <p class="font-medium">
                {{ formatDate(selectedReturn.created_at) }}
              </p>
            </div>
          </div>

          <div>
            <p class="text-sm obotoronika-muted-text">
              Reason
            </p>
            <p class="font-medium">
              {{ selectedReturn.reason }}
            </p>
          </div>

          <div v-if="selectedReturn.description">
            <p class="text-sm obotoronika-muted-text">
              Description
            </p>
            <p class="font-medium">
              {{ selectedReturn.description }}
            </p>
          </div>

          <div v-if="selectedReturn.admin_notes">
            <p class="text-sm obotoronika-muted-text">
              Admin Notes
            </p>
            <p class="font-medium">
              {{ selectedReturn.admin_notes }}
            </p>
          </div>

          <!-- Actions for pending returns -->
          <div v-if="selectedReturn.status === 'pending'" class="pt-4 border-t">
            <p class="text-sm obotoronika-muted-text mb-2">
              Your return request is pending review.
            </p>
            <UButton
              color="red"
              variant="outline"
              size="sm"
              :loading="isWithdrawing"
              @click="handleWithdraw"
            >
              Withdraw Request
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
