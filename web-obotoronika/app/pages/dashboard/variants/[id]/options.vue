<script lang="ts" setup>
import { format } from 'date-fns'
import { useVariantStore } from '@/stores/variants'
import { UBreadcrumb, UButton, UDropdown, UIcon, UModal, UTable } from '#components'

const route = useRoute()

// Store
const store = useVariantStore()

const variantID = route.params.id

const columns = [
  {
    key: 'label',
    label: 'Display Name',
  },
  {
    key: 'value',
    label: 'Value',
  },
  {
    key: 'updated_at',
    label: 'Last Updated',
    sortable: true,
  },
  {
    key: 'actions',
    label: 'Action',
  },
]

const isOpenModal = ref(false)
const optionID = ref<number | null>(null)

store.getOptions(variantID as string)

const links = [
  {
    label: 'Products',
    icon: 'fluent-mdl2:product-variant',
    to: '/dashboard/products',
  },
  {
    label: 'Variants',
    icon: 'i-heroicons-square-3-stack-3d',
    to: '/dashboard/variants',
  },
  { label: store.options.data.name ?? '' },
]

const actionItems = (row: any) => [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {
        isOpenModal.value = true
        optionID.value = row.id
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      click: async () => {
        await fetch(`/api/dashboard/variants/options/${row.id}`, { method: 'delete' })
        await store.getOptions(variantID as string)
      },
    },
  ],
]

const handleCloseVariant = async () => {
  await store.getOptions(variantID as string)
  isOpenModal.value = false
}

useHead({
  title: 'Add Variant Option',
})
</script>

<template>
  <div>
    <div class="flex justify-between mb-6">
      <UBreadcrumb title="Products" :links="links" />
      <UButton
        label="Add Option"
        size="lg"
        icon="i-heroicons-plus"
        block
        class="w-40 h-fit"
        color="black"
        @click="isOpenModal = true"
      />
    </div>
    <UTable :columns="columns" :rows="store.options.data.values" :loading="store.options.isLoading">
      <template #label-data="{ row }">
        <p class="py-1.5">
          {{ row.label ?? store.options.data.field_type
          }}<span v-if="!row.label">.{{ row.value }}</span>
        </p>
      </template>
      <template #value-data="{ row }">
        <p
          v-if="store.options.data.field_type === 'color'"
          class="flex items-center gap-1"
        >
          <span
            :style="{ backgroundColor: row.value }"
            class="w-7 h-7 rounded-md block"
          />
          <span>{{ row.value }}</span>
        </p>
        <p v-else>
          {{ row.value }}
        </p>
      </template>
      <template #updated_at-data="{ row }">
        <p>{{ format(new Date(row.updated_at), "dd MMMM yyyy HH:mm") }}</p>
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
    <UModal
      v-model="isOpenModal"
      :ui="{ width: 'w-full sm:max-w-lg', container: 'items-center' }"
      @close="() => { optionID = null }"
    >
      <div class="p-4">
        <div class="flex justify-between">
          <h3 class="font-Homenaje text-3xl obotoronika-title">
            {{ optionID ? 'Update' : 'Add' }} Option
          </h3>
          <button @click="isOpenModal = false">
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>
        <VariantsAddOption
          :field_type="store.options.data.field_type"
          :variant_id="variantID"
          :option_id="optionID"
          @close="handleCloseVariant"
        />
      </div>
    </UModal>
  </div>
</template>
