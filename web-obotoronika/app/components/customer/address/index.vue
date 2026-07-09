<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { UButton, UDropdown, UTable } from '#components'

const emit = defineEmits(['open'])

const columns = [
  {
    key: 'fullname',
    label: 'Name',
  },
  {
    key: 'phone',
    label: 'Phone',
  },
  {
    key: 'address',
    label: 'Address',
  },
  // {
  //   key: "address_type",
  //   label: "Address Type",
  // },
  {
    key: 'is_default',
    label: 'Default',
  },
  {
    key: 'actions',
  },
]

const toast = useToast()

const store = useUserStore()
const settingsStore = useSettingsStore()

const actionItems = (row: any) => [
  [
    {
      label: 'Make Default',
      icon: 'i-heroicons-arrow-path-rounded-square',
      click: async () => {
        settingsStore.setIsPageLoading(true)
        await useFetch(`/api/profiles/addresses/${row.id}/default`, {
          method: 'PATCH',
        })
        await store.getAddresses()
        settingsStore.setIsPageLoading(false)
        toast.add({
          title: 'Address made default',
        })
      },
    },
  ],
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {
        emit('open', row)
      },
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
                await useFetch(`/api/profiles/addresses/${row.id}`, {
                  // @ts-ignore
                  method: 'DELETE',
                })
                toast.add({
                  title: 'Address deleted',
                  description: 'The address has been successfully deleted.',
                })
                await store.getAddresses()
              }
              catch {
                toast.add({
                  title: 'Error deleting address',
                  description: 'An error occurred while deleting the address.',
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
</script>

<template>
  <div>
    <UTable :rows="store.addresses" :columns="columns">
      <template #address-data="{ row }">
        <div class="flex gap-2 h-fit items-center">
          <span
            v-if="row.address_type === 'home'"
            class="bg-primary text-white px-1 rounded-md capitalize text-xs h-fit"
          >{{ row.address_type }}</span>
          <span
            v-else
            class="bg-gray-800 text-white px-1 rounded-md capitalize text-xs h-fit"
          >{{ row.address_type }}</span>
          <span class="max-w-44 block text-wrap">{{ row.address }},
            <span class="capitalize">{{ row.city }}, {{ row.region }}</span></span>
        </div>
      </template>
      <template #address_type-data="{ row }">
        <span
          v-if="row.address_type === 'home'"
          class="bg-primary text-white px-1 rounded-md capitalize text-xs"
        >{{ row.address_type }}</span>
        <span
          v-else
          class="bg-gray-800 text-white px-1 rounded-md capitalize text-xs"
        >{{ row.address_type }}</span>
      </template>
      <template #is_default-data="{ row }">
        <span
          v-if="row.is_default === true"
          class="bg-green-500 text-white px-1 rounded-md capitalize text-xs"
        >Yes</span>
        <span v-else />
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
  </div>
</template>
