<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { UAvatar, UBadge, UBreadcrumb, UButton, UDropdown, UInput, UPagination, USelectMenu, UTable, UTooltip } from '#components'
// import { useDashboardStore } from '@app/stores/dashboard';

// Dynamic import for StarRating component (client-side only)
// let StarRating: any
// if (typeof window !== 'undefined') {
//   // @ts-ignore
//   StarRating = (await import('vue-star-rating')).default
// }

const dashboardStore = useDashboardStore()
const { role } = useAuth()
const toast = useToast()

// @ts-ignore
await dashboardStore.fetchProducts()
// @ts-ignore
await dashboardStore.fetchCategories()

const getColumns = (roles: string[]) => {
  const columns = [
    { key: 'product', label: 'Product' },
    { key: 'sku', label: 'SKU', sortable: false },
    { key: 'stock', label: 'Stock', sortable: true },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      direction: 'desc' as const,
    },
    { key: 'rating', label: 'Rating' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ]

  if (roles.includes(role.value ?? '')) {
    columns.splice(1, 0, {
      key: 'merchant',
      label: 'Merchant',
      sortable: false,
    })
  }
  return columns
}

const statusOptions = [
  {
    label: 'published',
    value: 'published',
  },
  {
    label: 'pending',
    value: 'pending',
  },
  {
    label: 'draft',
    value: 'draft',
  },
  {
    label: 'archived',
    value: 'archived',
  },
]

// Navigation links
const links = [
  {
    label: 'Products',
    icon: 'fluent-mdl2:product-variant',
    to: '/dashboard/products',
  },
  { label: 'List', icon: 'i-heroicons-list-bullet' },
]

// const date = ref()
// const selected = ref<any[]>([])
const config = useRuntimeConfig()

// Categories
const categories = computed(
  () =>
    dashboardStore.categories?.data?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) ?? [],
)

// Action items for rows
const actionItems = (row: any) => [
  [{ label: 'View', icon: 'i-heroicons-eye', to: `/products/${row.slug}` }],
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      to: `/dashboard/products/edit/${row.id}`,
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      click: () => {
        toast.add({
          title: 'Are you sure?',
          description: 'This action cannot be undone.',
          timeout: 0,
          actions: [{
            label: 'Yes',
            color: 'red',
            variant: 'link',
            click: async () => {
              try {
                await useFetch(`/api/dashboard/products/${row.id}`, {
                  method: 'DELETE',
                })
                toast.add({
                  title: 'Product deleted',
                  description: 'The product has been successfully deleted.',
                })
                dashboardStore.fetchProducts()
              }
              catch {
                toast.add({
                  title: 'Error deleting product',
                  description: 'An error occurred while deleting the product.',
                  color: 'red',
                })
              }
            },
          }],
        })
      },
    },
  ],
]

// Calculate rating for a row
const _calculateRating = (row: any): number => {
  if (!row.reviews?.length) return 0

  const totalPoints = row.reviews.reduce(
    (sum: number, review: any) => sum + review.rating,
    0,
  )
  return totalPoints / row.reviews.length
}

// Progress bar width calculation
const progressWidth = (row: any): number => {
  if (!row.current_stock || !row.initial_stock) return 0
  const percentage = (row.current_stock / row.initial_stock) * 100
  return percentage > 100 ? 100 : percentage
}

const badgeColor = (status: string): any => {
  const colorMap: Record<string, any> = {
    published: 'green',
    pending: 'yellow',
    draft: 'gray',
  }
  return colorMap[status] || undefined
}

// Pagination and filtering handlers
const handlePageChange = (page: number) => {
  dashboardStore.setProductsPagination(
    page,
    dashboardStore.products.meta.perPage,
  )
}

const handleSearch = (query: string) => {
  dashboardStore.setProductsSearchQuery(query)
}

const handleFilter = (key: string, value: string) => {
  dashboardStore.setProductsFilter(key, value)
}

const _handleSort = (sortBy: string, sortOrder: string) => {
  dashboardStore.setProductsSorting(sortBy, sortOrder)
}

// Page metadata
useHead({
  title: 'Products | Obotoronika',
})
</script>

<template>
  <div>
    <div class="flex justify-between">
      <UBreadcrumb title="Products" :links="links" />
      <UButton
        label="Add Products"
        size="lg"
        icon="i-heroicons-plus"
        block
        class="w-40 h-fit"
        color="black"
        to="/dashboard/products/new"
      />
    </div>
    <Toolbar>
      <template #left>
        <UTooltip text="Refresh">
          <UButton
            label=""
            color="gray"
            :trailing-icon="
              dashboardStore.products.isLoading
                ? undefined
                : 'i-heroicons-arrow-path'
            "
            :loading="dashboardStore.products.isLoading"
            ui:loading-icon="i-heroicons-arrow-path animate-spin"
            size="md"
            @click="dashboardStore.fetchProducts"
          />
        </UTooltip>
        <UInput
          placeholder="Search products"
          size="md"
          @input="handleSearch($event.target.value)"
        />
      </template>
      <template #right>
        <USelectMenu
          v-model="dashboardStore.products.filter.filterBy.category"
          :options="categories"
          value-attribute="value"
          option-attribute="label"
          placeholder="Filter by category"
          class="w-32 md:w-28 lg:w-40 hidden lg:block"
          size="md"
          @change="
            handleFilter(
              'category',
              dashboardStore.products.filter.filterBy.category,
            )
          "
        />
        <USelectMenu
          v-model="dashboardStore.products.filter.filterBy.status"
          :options="statusOptions"
          value-attribute="value"
          option-attribute="label"
          placeholder="Filter by status"
          class="w-32 md:w-28 lg:w-40 hidden lg:block"
          size="md"
          @change="
            handleFilter(
              'status',
              dashboardStore.products.filter.filterBy.status,
            )
          "
        />
        <UButton
          variant="solid"
          label="Reset"
          :trailing="false"
          size="md"
          class="hidden lg:block"
          :disabled="!Object.keys(dashboardStore.products.filter.filterBy ?? {}).length"
          @click="dashboardStore.resetProductsFilter"
        />
        <UButton
          icon="i-heroicons-funnel"
          variant="solid"
          label="Filter"
          :trailing="false"
          size="md"
          class="lg:hidden"
        />
      </template>
    </Toolbar>

    <main class="mt-6">
      <UTable
        :columns="getColumns(['admin', 'super_admin', 'manager'])"
        :rows="dashboardStore.products.data"
      >
        <template #product-data="{ row }">
          <div class="flex gap-3 items-center">
            <div>
              <UAvatar
                :src="`${config.public.mediaUrl}${row.thumbnail}`"
                :alt="row.title"
                :ui="{ rounded: 'rounded-md' }"
                size="md"
                class="object-cover"
              />
            </div>
            <div>
              <h3 class="font-semibold text-base obotoronika-text-color">
                {{ row?.title }}
              </h3>
              <p class="text-sm">
                {{ row?.category?.name }}
              </p>
            </div>
          </div>
        </template>
        <template #merchant-data="{ row }">
          {{ row?.merchant.name }}
        </template>
        <template #sku-data="{ row }">
          {{ row?.sku ? row?.sku : "N/A" }}
        </template>
        <template #stock-data="{ row }">
          <div class="py-2.5">
            <div class="w-24 bg-gray-200 h-2 rounded-full overflow-hidden mb-1">
              <span
                :style="{ width: progressWidth(row) + '%' }"
                :class="[
                  'block h-full',
                  row.current_stock <= row.low_stock_alert
                    ? 'bg-yellow-500'
                    : 'bg-green-500',
                ]"
              />
            </div>
            <span>{{ row.current_stock }} in stock</span>
          </div>
        </template>
        <template #status-data="{ row }">
          <UBadge
            :label="row.status"
            :color="badgeColor(row.status)"
            variant="subtle"
            class="capitalize"
          />
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="actionItems(row)">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-horizontal-20-solid"
            />
          </UDropdown>
        </template>
      </UTable>
      <div class="flex justify-end px-3 py-3.5">
        <UPagination
          v-model="dashboardStore.products.meta.currentPage"
          :page-count="dashboardStore.products.meta.perPage"
          :total="dashboardStore.products.meta.totalProducts"
          @update:model-value="handlePageChange"
        />
      </div>
    </main>
  </div>
</template>
