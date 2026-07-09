<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { format } from 'date-fns'
import { UBadge, UButton, UDropdown, UPagination, UPopover, USelectMenu, UTable, UTooltip } from '#components'

const columns = [
  { key: 'order_id', label: 'ID' },
  { key: 'name', label: 'Customer Name' },
  { key: 'payment_type', label: 'Payment Type' },
  { key: 'total_amount', label: 'Total' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const router = useRouter()

const date = ref()
const isRefreshing = ref(false)
const selectedStatus: any = ref('')
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Awaiting Payment', value: 'awaiting_payment' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Canceled', value: 'canceled' },
  { label: 'Returned', value: 'returned' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Failed', value: 'failed' },
]

const store = useDashboardStore()

const handleRefresh = async () => {
  isRefreshing.value = true
  await store.fetchDashboardOrders()
  isRefreshing.value = false
}

const badgeColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'yellow',
    awaiting_payment: 'amber',
    processing: 'blue',
    shipped: 'indigo',
    delivered: 'teal',
    completed: 'green',
    canceled: 'red',
    returned: 'rose',
    refunded: 'pink',
    failed: 'gray',
  }

  return colorMap[status] || 'gray'
}

const handlePageChange = (page: number) => {
  store.setOrderPagination(
    page,
    store.orders.meta.perPage,
  )
}

const formatStatus = (status: string): string => {
  return status
    .replace(/_/g, ' ') // replace underscores with spaces
    .replace(/\b\w/g, char => char.toUpperCase()) // capitalize each word
}
const formatDateTime = (date: string) => format(new Date(date), 'dd MMM yyyy, hh:mm a')

const actionItems = (id: string) => [
  [
    {
      label: 'View',
      icon: 'i-heroicons-eye',
      click: () => {
        router.push(`/dashboard/orders/${id}`)
      },
    },
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {
        // isOpen.value = true
        // userId.value = row.id
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      click: () => {
        console.log('delete')
      },
    },
  ],
]
</script>

<template>
  <div>
    <Toolbar class="border-t-0">
      <template #left>
        <div class="flex gap-4 items-center">
          <UTooltip text="Refresh">
            <UButton
              label=""
              :trailing-icon="isRefreshing ? undefined : 'i-heroicons-arrow-path'"
              color="gray"
              :loading="isRefreshing"
              ui:loading-icon="i-heroicons-arrow-path animate-spin"
              size="md"
              @click="handleRefresh"
            />
          </UTooltip>
          <USelectMenu
            v-model="selectedStatus"
            :options="statusOptions"
            value-attribute="value"
            option-attribute="label"
            placeholder="Filter by status"
            class="w-32 md:w-28 lg:w-40"
            size="md"
          />
        </div>
      </template>
      <template #right>
        <div>
          <UPopover :popper="{ placement: 'bottom-start' }">
            <UButton
              icon="i-heroicons-calendar-days-20-solid"
              :label="date ? format(date, 'd MMM, yyy') : 'Filter by date'"
              block
              variant="outline"
            />
            <template #panel="{ close }">
              <DatePicker v-model="date" is-required @close="close" />
            </template>
          </UPopover>
        </div>
      </template>
    </Toolbar>
    <div class="mt-6">
      <UTable :columns="columns" :rows="store.orders.orders">
        <template #order_id-data="{ row }">
          <p class="py-1.5">
            #{{ row.external_order_id.split("-").at(-1) }}
          </p>
        </template>
        <template #name-data="{ row }">
          <p>
            {{ row.user_name || row.shipping_address?.fullname || row.shipping_address?.name || "Guest" }}
          </p>
        </template>
        <template #date-data="{ row }">
          <p>
            {{ formatDateTime(row.order_created_at) }}
          </p>
        </template>
        <template #payment_type-data="{ row }">
          <p>
            {{ row.payment_method || "Manual" }}
          </p>
        </template>
        <template #status-data="{ row }">
          <UBadge
            :label="formatStatus(row.order_status)"
            :color="badgeColor(row.order_status)"
            variant="subtle"
            class="capitalize"
          />
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="actionItems(row.external_order_id)">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-horizontal-20-solid"
            />
          </UDropdown>
        </template>
      </UTable>
    </div>
    <div class="flex justify-end px-3 py-3.5">
      <UPagination
        v-model="store.orders.meta.page"
        :page-count="store.orders.meta.perPage"
        :total="store.orders.meta.total"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>
