<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { UAvatar, UBadge, UBreadcrumb, UButton, UDropdown, UModal, UPagination, UTable, UTooltip } from '#components'

const columns = [
  {
    key: 'name',
    label: 'Category',
    sortable: true,
  },
  {
    key: 'parent_name',
    label: 'Parent',
    sortable: true,
  },
  {
    key: 'description',
    label: 'Description',
    sortable: false,
  },
  {
    key: 'product_count',
    label: 'Products',
    sortable: false,
    direction: 'desc' as const,
  },
  {
    key: 'actions',
    label: 'Actions',
  },
]
const links = [{
  label: 'Categories',
  icon: 'material-symbols:category-outline-rounded',
  to: '/dashboard/categories',
}, {
  label: 'List',
  icon: 'i-heroicons-list-bullet',
}]

const config = useRuntimeConfig()
const toast = useToast()

const store = useDashboardStore()

// @ts-ignore
await store.fetchCategories()

const selected = ref([])
const isConfirmDeleteOpen = ref(false)
const isDeleting = ref(false)

const items = (row: any) => [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      to: `/dashboard/categories/${row.id}/edit`,
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      click: async () => {
        try {
          await $fetch(`/api/dashboard/categories/${row.id}`, { method: 'DELETE' })
          toast.add({
            title: 'Category Removed Successfully.',
            description: 'The category has been deleted, and related products are no longer listed under it.',
            actions: [{
              label: 'Undo',
              click: async () => {
                await $fetch(`/api/dashboard/categories/${row.id}/undo-delete`, { method: 'PATCH' })
                store.fetchCategories(true)
              },
            }],
          })
          store.fetchCategories(true)
        }
        catch {
          toast.add({ title: 'Failed to delete category.', description: 'Failed to delete category or category already deleted.', color: 'red' })
        }
      },
    },
  ],
]

const handleDelete = async () => {
  try {
    isDeleting.value = true
    const categories = selected.value.map((category: any) => (category.id))
    await $fetch(`/api/dashboard/categories/bulk?categories=${categories}`, { method: 'DELETE' })
    isConfirmDeleteOpen.value = false
    scnToast('Categories deleted successfully.', {
      description: 'The selected categories have been removed, and related products are no longer listed under them.',
    })
    store.fetchCategories(true)
  }
  catch {
    toast.add({ title: 'Failed to delete category.', description: 'Failed to delete category or category already deleted.', color: 'red' })
  }
  finally {
    isDeleting.value = false
  }
}

const handleRefresh = async () => {
  store.fetchCategories(true)
}

const handlePageChange = (page: number) => {
  store.setCategoriesPagination(
    page,
    store.categories.meta.perPage,
  )
}

useHead({
  title: 'Categories | Obotoronika',
})
</script>

<template>
  <div>
    <UModal v-model="isConfirmDeleteOpen">
      <div class="p-4">
        <h1 class="font-semibold text-lg obotoronika-text-color mb-2.5">
          Are You Sure You Want to Proceed?
        </h1>
        <p class="obotoronika-text-color mt-1.5">
          This action is irreversible. Deleting a category will also remove all associated products and data. Once
          deleted,
          this cannot be undone. Please confirm if you wish to continue.
        </p>
      </div>
      <div class="px-4 pb-4 flex justify-end gap-2">
        <UButton
          :label="`${isDeleting ? 'Deleting' : 'Confirm'}`"
          color="red"
          variant="solid"
          size="md"
          :loading="isDeleting"
          @click="handleDelete"
        />
        <UButton
          label="Cancel"
          variant="solid"
          color="gray"
          size="md"
          @click="isConfirmDeleteOpen = false"
        />
      </div>
    </UModal>
    <div class="flex justify-between items-center">
      <UBreadcrumb title="Categories" :links="links" />
      <UButton
        label="Add Category"
        icon="i-heroicons-plus"
        block
        class="w-40 h-fit"
        color="black"
        to="/dashboard/categories/new"
      />
    </div>
    <Toolbar>
      <template #left>
        <UButton
          :label="`Delete ${selected.length ? `(${selected.length})` : ''}`"
          trailing-icon="i-heroicons-trash"
          color="red"
          :disabled="selected.length ? false : true"
          size="md"
          variant="soft"
          @click="isConfirmDeleteOpen = true"
        />
        <UTooltip text="Refresh">
          <UButton
            label=""
            :trailing-icon="store.categories.isLoading ? undefined : 'i-heroicons-arrow-path'"
            color="gray"
            :loading="store.categories.isLoading"
            ui:loading-icon="i-heroicons-arrow-path animate-spin"
            size="md"
            @click="handleRefresh"
          />
        </UTooltip>
      </template>
    </Toolbar>
    <main class="mt-6">
      <UTable
        v-model="selected"
        :columns="columns"
        :rows="store.categories.data"
        :loading="false"
        :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
      >
        <template #name-data="{ row }">
          <div class="flex items-center gap-2">
            <UAvatar :src="`${config.public.mediaUrl}${row.thumbnail}`" />
            {{ row.name }}
          </div>
        </template>
        <template #parent_name-data="{ row }">
          <p>
            {{ row.parent_name ? row.parent_name : 'N/A' }}
          </p>
        </template>
        <template #description-data="{ row }">
          <p class="max-w-64 text-wrap">
            {{ row.description }}
          </p>
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
      <div class="flex justify-end px-3 py-3.5">
        <UPagination
          v-model="store.categories.meta.page"
          :page-count="store.categories.meta.perPage"
          :total="store.categories.meta.total"
          @update:model-value="handlePageChange"
        />
      </div>
    </main>
  </div>
</template>
