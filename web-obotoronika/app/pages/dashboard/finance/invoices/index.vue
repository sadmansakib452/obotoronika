<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { format } from 'date-fns'
import { useFinanceStore } from '@/stores/finance'
import { UAvatar, UBadge, UBreadcrumb, UButton, UInput, UPagination, USelectMenu, UTable, UTooltip } from '#components'

const links = [
  {
    label: 'Finance',
    icon: 'solar:wallet-outline',
    to: '/dashboard/products',
  },
  { label: 'Invoices', icon: 'i-heroicons-list-bullet' },
]

const columns = [
  { key: 'customer', label: 'Customer' },
  { key: 'email', label: 'Email/Phone' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created' },
  { key: 'actions', label: '' },
]

const badgeColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    unpaid: 'red',
    paid: 'green',
    refunded: 'gray',
    partially_refunded: 'orange',
    pending: 'yellow',
    failed: 'rose',
  }

  return colorMap[status] || 'gray' // Default fallback color
}

const store = useFinanceStore()

const handlePageChange = (page: number) => {
  store.setInvoicesPagination(
    page,
    store.invoices.pagination.perPage,
  )
}

onNuxtReady(async () => {
  await store.fetchInvoices()
})

useHead({
  title: 'Invoices | Obotoronika',
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
              ''
                ? undefined
                : 'i-heroicons-arrow-path'
            "
            :loading="false"
            ui:loading-icon="i-heroicons-arrow-path animate-spin"
            size="md"
          />
        </UTooltip>
        <UInput
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
      :rows="store.invoices.data"
      class="mt-4"
      :columns="columns"
      :loading="store.invoices.isLoading"
    >
      <template #customer-data="{ row }">
        <div class="py-2.5 flex items-center gap-2">
          <UAvatar
            :src="row.customer.avatar_url"
            :alt="row.customer.name"
          />
          <div>
            <h3 class="font-semibold obotoronika-title">
              {{ row.customer.name }}
            </h3>
            <p class="text-xs obotoronika-text">
              {{ row.invoice_reference }}
            </p>
          </div>
        </div>
      </template>
      <template #email-data="{ row }">
        <p class="obotoronika-text">
          {{ row.customer.email ?? 'N/A' }}
        </p>
        <p class="obotoronika-text">
          {{ row.customer.phone ?? 'N/A' }}
        </p>
      </template>
      <template #amount-data="{ row }">
        <p class="obotoronika-text">
          {{ row.total }}
        </p>
      </template>
      <template #status-data="{ row }">
        <UBadge
          :label="row.invoice_status"
          :color="badgeColor(row.invoice_status)"
          variant="subtle"
          class="capitalize"
        />
      </template>
      <template #created_at-data="{ row }">
        <div>
          <h3 class="font-semibold obotoronika-text">
            {{ format(row.issued_at, 'MMMM d, yyyy') }}
          </h3>
          <p class="text-xs obotoronika-text">
            {{ format(row.issued_at, 'h:mm a') }}
          </p>
        </div>
      </template>
      <template #actions-data="{ row }">
        <div>
          <UButton
            size="sm"
            color="white"
            variant="outline"
            label="Details"
            :to="`/dashboard/finance/invoices/${row.invoice_reference}`"
          />
        </div>
      </template>
    </UTable>
    <div class="flex justify-end px-3 py-3.5">
      <UPagination
        v-model="store.invoices.pagination.page"
        :page-count="store.invoices.pagination.perPage"
        :total="store.invoices.pagination.total"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>
