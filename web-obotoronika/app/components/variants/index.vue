<script setup lang="ts">
import { format } from 'date-fns'
import { UButton, UDropdown, UTable } from '#components'

const emit = defineEmits(['refresh'])

const columns = [
  {
    key: 'name',
    label: 'Variants Name',
  },
  {
    key: 'description',
    label: 'Description',
  },
  {
    key: 'author_name',
    label: 'Added by',
  },
  {
    key: 'updated_at',
    label: 'Last Updated',
    sortable: true,
  },

  {
    key: 'value_count',
    label: 'Entries',
  },
  {
    key: 'actions',
    label: 'Action',
  },
]

type Item = {
  id: number
  name: string
  description?: string
  author_name: string
}

interface IProps {
  items: Item[]
  isLoading: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
  isLoading: false,
})

const router = useRouter()

const actionItems = (row: any) => [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {},
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      click: async () => {
        await fetch(`/api/dashboard/variants/${row.id}`, {
          method: 'delete',
        })
        emit('refresh')
      },
    },
  ],
]

function select(row: any) {
  router.push(`/dashboard/variants/${row.id}/options`)
}
</script>

<template>
  <div class="mt-6">
    <UTable
      :columns="columns"
      :rows="props.items"
      :loading="props.isLoading"
      @select="select"
    >
      <template #updated_at-data="{ row }">
        <p class="py-1.5">
          {{ format(new Date(row.updated_at), "dd MMMM yyyy HH:mm") }}
        </p>
      </template>
      <template #description-data="{ row }">
        <p class="py-1.5">
          {{ row.description ? row.description : "NULL" }}
        </p>
      </template>
      <template #actions-data="{ row }">
        <div @click.stop>
          <UDropdown :items="actionItems(row)">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-horizontal-20-solid"
            />
          </UDropdown>
        </div>
      </template>
    </UTable>
  </div>
</template>
