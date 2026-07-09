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
    label: 'Suspended',
    value: 'suspended',
  },
  {
    label: 'banned',
    value: 'banned',
  },
]
const roleOptions = [
  {
    key: 'super_admin',
    label: 'Super Admin',
    value: 'super_admin',
  },
  {
    key: 'admin',
    label: 'Admin',
    value: 'admin',
  },
  {
    key: 'manager',
    label: 'Manager',
    value: 'manager',
  },
  {
    key: 'customer',
    label: 'Customer',
    value: 'customer',
  },
  {
    key: 'seller',
    label: 'Seller',
    value: 'seller',
  },
]

// Reactive variables
const q = ref('')
const sort = ref({ column: 'id', direction: 'asc' as const })
const page = ref(1)
const selectedStatus: any = ref('')
const selectedRole = ref('')
const isOpen = ref(false)
const userId = ref(null)
const isRefreshing = ref(false)

const query = computed(() => ({
  filterBy: {
    status: selectedStatus.value,
    role: selectedRole.value,
  },
  q: q.value,
  sort: sort.value.column,
  page: page.value,
  order: sort.value.direction,
  perPage: 10,
}))

// @ts-ignore
const { data, pending, refresh } = await useFetch('/api/dashboard/users', {
  query,
  default: () => ({
    status: 200,
    message: 'OK',
    data: { users: [] },
    paginate: { hasNext: false, page: 1, perPage: 10, total: 0 },
  }),
})
const fetchedData = data as unknown as SuccessResponse || { data: { users: [], groupedResult: {} } }

const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    label: 'Email / Phone',
    sortable: false,
    direction: 'desc' as const,
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    direction: 'asc' as const,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    direction: 'desc' as const,
  },
  {
    key: 'createdAt',
    label: 'Created At',
    sortable: false,
    direction: 'asc' as const,
  },
  {
    key: 'actions',
    label: 'Actions',
  },
]

const links = [
  {
    label: 'Analytics',
    icon: 'mage:dashboard-fill',
    to: '/dashboard/analytics',
  },
  {
    label: 'Manage User',
    icon: 'fa6-solid:users-gear',
  },
]

const resetFilter = () => {
  selectedStatus.value = ''
  selectedRole.value = ''
  page.value = 1
  q.value = ''
}
const closeModal = () => {
  isOpen.value = false
  userId.value = null
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

const handleRefresh = async () => {
  isRefreshing.value = true
  await refresh()
  isRefreshing.value = false
}

const items = (row: any) => [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {
        isOpen.value = true
        userId.value = row.id
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      click: async () => {
        await useFetch(`/api/dashboard/users/${row.id}`, { method: 'delete' })
        handleRefresh()
      },
    },
  ],
]

const closeAndRef = () => {
  closeModal()
  handleRefresh()
}

definePageMeta({
  roles: ['admin', 'super_admin', 'manager'],
})
useHead({
  title: 'Users | Obotoronika',
})
</script>

<template>
  <main>
    <div class="flex justify-between items-center border-b border-gray-100 dark:border-theme-border -mx-8 px-8 pb-3">
      <UBreadcrumb title="Users" :links="links" />
      <UButton
        icon="i-heroicons-plus"
        size="lg"
        color="black"
        variant="solid"
        label="ADD NEW USER"
        :trailing="false"
        @click="isOpen = true"
      />
    </div>

    <div class="cards">
      <div class="card">
        <div class="header">
          <span class="admin icon">
            <Icon name="solar:user-linear" />
          </span>
          <h2>Administrator</h2>
        </div>
        <div class="flex gap-2 items-center">
          <template v-if="fetchedData?.data?.groupedResult?.admin">
            <UAvatarGroup size="sm" :max="3">
              <UAvatar
                v-for="(item, index) in fetchedData?.data?.groupedResult?.admin
                  .count"
                :key="index"
                :alt="fetchedData?.data?.groupedResult?.admin?.names[index]"
                :src="fetchedData?.data?.groupedResult?.admin?.avatars[index]"
              />
            </UAvatarGroup>
            <p class="obotoronika-text-color text-sm mb-0">
              Total {{ fetchedData?.data?.groupedResult?.admin?.count }} Users
            </p>
          </template>
          <p v-else class="text-sm obotoronika-text-color">
            No Users found
          </p>
        </div>
      </div>
      <div class="card">
        <div class="header">
          <span class="manager icon">
            <Icon name="solar:user-linear" />
          </span>
          <h2>Manager</h2>
        </div>
        <div class="flex gap-2 items-center">
          <template v-if="fetchedData?.data?.groupedResult?.manager">
            <UAvatarGroup size="sm" :max="3">
              <UAvatar
                v-for="(item, index) in fetchedData?.data?.groupedResult
                  ?.manager.count"
                :key="index"
                :alt="fetchedData?.data?.groupedResult?.manager?.names[index]"
                :src="fetchedData?.data?.groupedResult?.manager?.avatars[index]"
              />
            </UAvatarGroup>
            <p class="obotoronika-text-color text-sm mb-0">
              Total {{ fetchedData?.data?.groupedResult?.manager?.count }} Users
            </p>
          </template>
          <p v-else class="text-sm obotoronika-text-color">
            No Users found
          </p>
        </div>
      </div>
      <div class="card">
        <div class="header">
          <span class="seller icon">
            <Icon name="solar:user-linear" />
          </span>
          <h2>Seller</h2>
        </div>
        <div class="flex gap-2 items-center">
          <template v-if="fetchedData?.data?.groupedResult?.seller">
            <UAvatarGroup size="sm" :max="3">
              <UAvatar
                v-for="(item, index) in fetchedData?.data?.groupedResult?.seller
                  .count"
                :key="index"
                :alt="fetchedData?.data?.groupedResult?.seller?.names[index]"
                :src="fetchedData?.data?.groupedResult?.seller?.avatars[index]"
              />
            </UAvatarGroup>
            <p class="obotoronika-text-color text-sm mb-0">
              Total {{ fetchedData?.data?.groupedResult?.seller?.count }} Users
            </p>
          </template>
          <p v-else class="text-sm obotoronika-text-color">
            No Users found
          </p>
        </div>
      </div>
      <div class="card">
        <div class="header">
          <span class="customer icon">
            <Icon name="solar:user-linear" />
          </span>
          <h2>Customer</h2>
        </div>
        <div class="flex gap-2 items-center">
          <template v-if="fetchedData?.data?.groupedResult?.customer">
            <UAvatarGroup size="sm" :max="3">
              <UAvatar
                v-for="(item, index) in fetchedData?.data?.groupedResult
                  ?.customer.count"
                :key="index"
                :alt="fetchedData?.data?.groupedResult?.customer?.names[index]"
                :src="fetchedData?.data?.groupedResult?.customer?.avatars[index]
                "
              />
            </UAvatarGroup>
            <p class="obotoronika-text-color text-sm mb-0">
              Total
              {{ fetchedData?.data?.groupedResult?.customer?.count }} Users
            </p>
          </template>
          <p v-else class="text-sm obotoronika-text-color">
            No Users found
          </p>
        </div>
      </div>
    </div>
    <Toolbar class="border-t-0">
      <template #left>
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
      </template>
      <template #right>
        <USelectMenu
          v-model="selectedRole"
          :options="roleOptions"
          value-attribute="value"
          option-attribute="label"
          placeholder="Filter by role"
          class="w-36 md:w-28 lg:w-40"
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
              size="md"
              @click="q = ''"
            />
          </template>
        </UInput>
        <UButton
          label="Reset"
          :disabled="!selectedStatus && !selectedRole && !q"
          size="md"
          @click="resetFilter"
        />
      </template>
    </Toolbar>
    <UTable
      v-model:sort="sort"
      :columns="columns"
      :rows="fetchedData.data.users"
      sort-mode="manual"
      :loading="pending"
      class="mt-6"
    >
      <template #name-data="{ row }">
        <span class="capitalize">{{ row?.user_metadata?.name?.split('_').join(' ') ?? row?.name?.split('_').join(' ') }}</span>
      </template>
      <template #email-data="{ row }">
        <div>
          <a v-if="row.email" class="lowercase block" :href="'mailto:' + row.email">{{ row.email }}</a>
          <a v-if="row.phone" class="block" :href="'tel:' + row.phone">{{ row.phone }}</a>
        </div>
      </template>
      <template #role-data="{ row }">
        <span class="capitalize">{{ row?.user_metadata?.role?.split('_').join(' ') ?? row?.role?.split('_').join(' ') }}</span>
      </template>
      <template #status-data="{ row }">
        <UBadge
          :label="row.user_metadata.status"
          :color="badgeColor(row.user_metadata.status)"
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
    <UModal v-model="isOpen" :ui="{ width: 'w-full sm:max-w-lg' }" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white obotoronika-text-color">
              {{ userId ? 'Edit User' : 'Create User' }}
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
        <DashboardUserForm :user-id="userId" @close="closeAndRef" />
      </UCard>
    </UModal>
  </main>
</template>

<style scoped>
@import url('./index.css');
</style>
