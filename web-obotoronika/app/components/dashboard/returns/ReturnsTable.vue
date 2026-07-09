<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { format } from 'date-fns'
import { UBadge, UButton, UDropdown, UPagination, UTable } from '#components'

const emit = defineEmits<{
  refresh: []
  pageChange: [page: number]
}>()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'order_id', label: 'Order ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'type', label: 'Type' },
  { key: 'reason', label: 'Reason' },
  { key: 'refund_amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Date' },
  { key: 'actions', label: 'Actions' },
]

const router = useRouter()
const store = useReturnsStore()

const badgeColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    received: 'blue',
    processing: 'indigo',
    completed: 'teal',
    failed: 'gray',
    withdrawn: 'orange',
  }
  return colorMap[status] || 'gray'
}

const handlePageChange = (page: number) => {
  store.setPagination(page, store.returns.pagination.perPage)
}

const formatStatus = (status: string): string => {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

const formatDateTime = (date: string) => format(new Date(date), 'dd MMM yyyy, hh:mm a')

const actionItems = (row: any) => [
  [
    {
      label: 'View Details',
      icon: 'i-heroicons-eye',
      click: () => {
        router.push(`/dashboard/returns/${row.id}`)
      },
    },
  ],
]

// Get current page data
const returns = computed(() => {
  const { page, perPage } = store.returns.pagination
  return store.getReturnsPage(page, perPage)
})
</script>

<template>
  <div>
    <UTable
      :rows="returns"
      :columns="columns"
      :loading="store.returns.isLoading"
    >
      <template #id-data="{ row }">
        <span class="font-medium">#{{ row.id }}</span>
      </template>
      <template #order_id-data="{ row }">
        <span class="font-medium">#{{ row.order_id }}</span>
      </template>
      <template #customer-data="{ row }">
        <div class="flex flex-col">
          <span class="text-sm font-medium">{{ row.user?.name || 'N/A' }}</span>
          <span class="text-xs text-gray-500">{{ row.user?.email || row.user?.phone || '' }}</span>
        </div>
      </template>
      <template #type-data="{ row }">
        <span class="capitalize">{{ row.type }}</span>
      </template>
      <template #reason-data="{ row }">
        <span class="line-clamp-1 max-w-xs" :title="row.reason">
          {{ row.reason }}
        </span>
      </template>
      <template #refund_amount-data="{ row }">
        <span class="font-medium">৳{{ row.refund_amount || 0 }}</span>
      </template>
      <template #status-data="{ row }">
        <UBadge :color="badgeColor(row.status)" variant="subtle">
          {{ formatStatus(row.status) }}
        </UBadge>
      </template>
      <template #date-data="{ row }">
        <span class="text-sm">{{ formatDateTime(row.created_at) }}</span>
      </template>
      <template #actions-data="{ row }">
        <UDropdown :items="actionItems(row)">
          <UButton
            icon="i-heroicons-ellipsis-horizontal"
            color="gray"
            variant="ghost"
            size="sm"
          />
        </UDropdown>
      </template>
    </UTable>
    <div class="flex justify-end px-3 py-3.5">
      <UPagination
        v-model="store.returns.pagination.page"
        :page-count="store.returns.pagination.perPage"
        :total="store.returns.pagination.total"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>