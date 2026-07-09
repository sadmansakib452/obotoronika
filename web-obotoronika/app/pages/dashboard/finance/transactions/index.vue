<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { watchDebounced } from '@vueuse/core'
import { useFinanceStore } from '@/stores/finance'
import { UAvatar, UBadge, UBreadcrumb, UButton, UIcon, UInput, UModal, UPagination, USelectMenu, UTable, UTooltip } from '#components'

const links = [
  {
    label: 'Finance',
    icon: 'solar:wallet-outline',
    to: '/dashboard/products',
  },
  { label: 'Transactions', icon: 'i-heroicons-list-bullet' },
]

const columns = [
  { key: 'name', label: 'Customer' },
  { key: 'transactions_id', label: 'Transaction ID' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'method', label: 'Payment Method' },
  {
    key: 'date',
    label: 'Date',
  },
  { key: 'actions', label: '' },
]

const isOpenModal = ref(false)
const transaction_id = ref<null | string>(null)
const search = ref('')
const transactions = computed(() => {
  const { page, perPage } = store.transactions.pagination
  const key = store.getTransactionPageKey(page, perPage, store.transactions.search)
  return store.transactions.data[key] ?? []
})

const store = useFinanceStore()

const handlePageChange = (page: number) => {
  store.setTransactionsPagination(
    page,
    store.transactions.pagination.perPage,
  )
}

const badgeColor = (status: string): any => {
  const colorMap: Record<string, any> = {
    VALID: 'green',
    pending: 'yellow',
    FAILED: 'red',
  }
  return colorMap[status] || undefined
}

const handleOpenDetails = (id: string) => {
  isOpenModal.value = true
  transaction_id.value = id
}

onMounted(async () => {
  try {
    await store.fetchTransactions()
  }
  catch (err) {
    console.error('Failed to fetch transactions:', err)
  }
})

watchDebounced(search, async (val) => {
  store.transactions.search = val
  await store.setTransactionsPagination(1, store.transactions.pagination.perPage, true)
}, { debounce: 300 })

useHead({
  title: 'Transactions | Obotoronika',
})
</script>

<template>
  <div>
    <div class="flex justify-between">
      <UBreadcrumb title="Products" :links="links" />
    </div>
    <Toolbar>
      <template #left>
        <UTooltip text="Refresh">
          <UButton
            label=""
            color="gray"
            :trailing-icon="
              store.transactions.isLoading
                ? undefined
                : 'i-heroicons-arrow-path'
            "
            :loading="store.transactions.isLoading"
            ui:loading-icon="i-heroicons-arrow-path animate-spin"
            size="md"
            @click="store.fetchTransactions"
          />
        </UTooltip>
        <UInput
          v-model="search"
          placeholder="Search by transactions ID"
          size="md"
        />
      </template>
      <template #right>
        <USelectMenu
          :options="[]"
          value-attribute="value"
          option-attribute="label"
          placeholder="Filter by status"
          class="w-32 md:w-28 lg:w-40 hidden lg:block"
          size="md"
        />
      </template>
    </Toolbar>
    <UTable
      :rows="transactions"
      class="mt-4"
      :columns="columns"
      :loading="store.transactions.isLoading"
    >
      <template #name-data="{ row }">
        <div class="flex gap-2 items-center">
          <UAvatar
            :alt="row.customer.name"
          />
          <p class="flex flex-col">
            <span class="text-sm font-medium">{{ row.customer.name }}</span>
            <span class="text-sm">{{ row.customer.email ? row.customer.email : row.customer.phone }}</span>
          </p>
        </div>
      </template>
      <template #transactions_id-data="{ row }">
        <p class="py-1.5">
          {{ row.transaction_id }}
        </p>
      </template>
      <template #amount-data="{ row }">
        <p>{{ row.merchant_earning }}</p>
      </template>
      <template #status-data="{ row }">
        <UBadge
          :label="row.transaction_status === 'VALID' ? 'SUCCESS' : row?.transaction_status?.toUpperCase()"
          :color="badgeColor(row.transaction_status)"
          variant="subtle"
          class="capitalize"
        />
      </template>
      <template #method-data="{ row }">
        {{ row.payment_method ?? 'N/A' }}
      </template>
      <template #date-data="{ row }">
        {{
          format(
            parseISO(row.order_date),
            "MMM d, yyyy, h.mm aaa",
          ).toUpperCase()
        }}
      </template>
      <template #actions-data="{ row }">
        <UButton
          label="Details"
          color="white"
          size="sm"
          @click="handleOpenDetails(row.transaction_id)"
        />
      </template>
    </UTable>
    <div class="flex justify-end px-3 py-3.5">
      <UPagination
        v-model="store.transactions.pagination.page"
        :page-count="store.transactions.pagination.perPage"
        :total="store.transactions.pagination.total"
        @update:model-value="handlePageChange"
      />
    </div>
    <UModal
      v-model="isOpenModal"
      :ui="{ width: 'w-full sm:max-w-lg', container: 'items-center' }"
    >
      <div class="p-4">
        <div class="flex justify-between">
          <h3 class="font-Homenaje text-3xl obotoronika-title">
            Transaction Details
          </h3>
          <button @click="isOpenModal = false">
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>
        <DashboardFinanceTransactionDetails v-if="transaction_id" :id="transaction_id" />
      </div>
    </UModal>
  </div>
</template>
