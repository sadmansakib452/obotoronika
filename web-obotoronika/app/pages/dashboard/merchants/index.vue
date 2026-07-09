<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { format } from 'date-fns'
import { UAvatar, UBadge, UBreadcrumb, UButton, UCard, UDropdown, UInput, UModal, UPagination, USelectMenu, UTable, UTooltip } from '#components'

const statusOptions = [
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'Inactive',
    value: 'inactive',
  },
  {
    label: 'Pending',
    value: 'pending',
  },
  {
    label: 'Suspended',
    value: 'suspended',
  },
  {
    label: 'banned',
    value: 'banned',
  },
]

const toast = useToast()

// Reactive variables
const q = ref('')
const sort = ref({ column: 'id', direction: 'asc' as const })
const page = ref(1)
const selectedStatus: any = ref('')
const isOpen = ref(false)
const merchantId = ref(null)
const isRefreshing = ref(false)
const selected = ref([])

const query = computed(() => ({
  filterBy: {
    status: selectedStatus.value,
  },
  q: q.value,
  sort: sort.value.column,
  page: page.value,
  order: sort.value.direction,
  perPage: 10,
}))

// @ts-ignore
const { data, pending, refresh }: any = await useFetch('/api/dashboard/merchants', {
  query,
  default: () => ({
    status: 200,
    message: 'OK',
    data: { groupedResult: {} },
    paginate: { hasNext: false, page: 1, perPage: 10, total: 0 },
  }),
})
const fetchedData = data.value as unknown as SuccessResponse

const config = useRuntimeConfig()

const columns = [
  {
    key: 'id',
    label: 'MERCHANT ID',
  },
  {
    key: 'name',
    label: 'BUSINESS NAME',
    sortable: true,
  },
  {
    key: 'website',
    label: 'WEBSITE',
  },
  {
    key: 'status',
    label: 'STATUS',
    sortable: true,
    direction: 'desc' as const,
  },
  {
    key: 'createdAt',
    label: 'CREATED AT',
    sortable: false,
    direction: 'asc' as const,
  },
  {
    key: 'actions',
    label: 'ACTIONS',
  },
]

const items = (row: any) => [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {
        isOpen.value = true
        merchantId.value = row.id
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      click: async () => {
        try {
          await $fetch(`/api/dashboard/merchants/${row.id}`, { method: 'DELETE' })
          toast.add({
            title: 'Merchant Removed Successfully.',
            description: 'The merchant has been deleted, and related products are no longer listed under it.',
            actions: [{
              label: 'Undo',
              click: async () => {
                await $fetch(`/api/dashboard/merchants/${row.id}/undo-delete`, { method: 'PATCH' })
                refresh()
              },
            }],
          })
          refresh()
        }
        catch {
          toast.add({ title: 'Failed to delete category.', description: 'Failed to delete category or category already deleted.', color: 'red' })
        }
      },
    },
  ],
]
const links = [
  {
    label: 'Merchants',
    icon: 'uim:house-user',
    to: '/dashboard/merchants',
  },
  {
    label: 'List',
    icon: 'i-heroicons-list-bullet',
  },
]

const resetFilter = () => {
  selectedStatus.value = ''
  page.value = 1
  q.value = ''
}
const closeModal = () => {
  isOpen.value = false
  merchantId.value = null
}

const handleRefresh = async () => {
  isRefreshing.value = true
  await refresh()
  isRefreshing.value = false
}

const badgeColor = (status: string): any => {
  const colorMap: Record<string, any> = {
    active: 'green',
    inactive: 'gray',
    suspended: 'yellow',
    banned: 'red',
  }
  return colorMap[status] || undefined
}

watch(isOpen, (newValue) => {
  if (!newValue) {
    merchantId.value = null
  }
})

definePageMeta({
  roles: ['admin', 'super_admin', 'manager'],
})

useHead({
  title: 'Merchants | Obotoronika',
})
</script>

<template>
  <main>
    <div class="flex justify-between items-center">
      <UBreadcrumb title="Categories" :links="links" />
      <UButton
        icon="i-heroicons-plus"
        color="black"
        variant="solid"
        label="Add Merchant"
        :trailing="false"
        class="uppercase"
        @click="isOpen = true"
      />
    </div>
    <Toolbar>
      <template #left>
        <UButton
          :label="`Delete ${selected.length ? `(${selected.length})` : ''}`"
          trailing-icon="i-heroicons-trash"
          color="red"
          size="md"
          variant="soft"
          disabled
        />
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
      </template>
      <template #right>
        <USelectMenu
          v-model="selectedStatus"
          :options="statusOptions"
          value-attribute="value"
          option-attribute="label"
          placeholder="Filter by status"
          class="w-32 md:w-28 lg:w-40"
          size="md"
        />
        <UInput
          v-model="q"
          placeholder="Search..."
          class="md:w-36 lg:w-auto"
          size="md"
          icon="i-heroicons-magnifying-glass-20-solid"
          :loading="pending"
          :ui="{ icon: { trailing: { pointer: '' } } }"
        >
          <template #trailing>
            <UButton
              v-show="q !== ''"
              color="gray"
              variant="link"
              icon="i-heroicons-x-mark-20-solid"
              :padded="false"
              @click="q = ''"
            />
          </template>
        </UInput>
        <UButton
          label="Reset"
          :disabled="!selectedStatus && !q"
          size="md"
          @click="resetFilter"
        />
      </template>
    </Toolbar>
    <UTable
      v-model:sort="sort"
      :columns="columns"
      :rows="data?.data?.merchants"
      sort-mode="manual"
      class="mt-6"
      :loading="pending"
    >
      <template #id-data="{ row }">
        <span>#{{ row.id }}</span>
      </template>
      <template #name-data="{ row }">
        <div class="flex gap-2 items-center">
          <UAvatar :src="row.logo ? `${config.public.mediaUrl}${row.logo}` : undefined" :alt="row.name" />
          <p>{{ row.name }}</p>
        </div>
      </template>
      <template #website-data="{ row }">
        <a
          v-if="row.website"
          :href="row.website"
          target="_blank"
          class="hover:underline"
        >{{ row.website }}</a>
        <span v-else>N/A</span>
      </template>
      <template #status-data="{ row }">
        <UBadge
          :label="row.status"
          :color="badgeColor(row.status)"
          variant="subtle"
          class="capitalize"
        />
      </template>
      <template #createdAt-data="{ row }">
        {{ format(row?.created_at, 'MM/dd/yyyy') }}
      </template>
      <template #actions-data="{ row }">
        <UDropdown :items="items(row)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </template>
    </UTable>
    <div class="flex justify-end px-3 py-3.5">
      <UPagination v-model="page" :page-count="10" :total="fetchedData?.data.paginate?.total || 0" />
    </div>
    <UModal v-model="isOpen" :ui="{ width: 'w-full sm:max-w-lg max-h-[80vh] overflow-y-auto' }" scrollable="false">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white obotoronika-text-color">
              {{ merchantId ? 'Edit Merchant' : 'Create Merchant' }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="closeModal"
            />
          </div>
        </template>
        <DashboardMerchantsForm :merchant-id="merchantId" @close-modal="() => isOpen = false" @refetch-data="refresh" />
      </UCard>
    </UModal>
  </main>
</template>
