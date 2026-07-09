<script setup lang="ts">
import { UBadge, UButton, UDropdown, UInput, UTable, UTooltip } from '#components'

interface Banner {
  id: number
  image_url: string
  title: string | null
  description: string | null
  button_text: string | null
  button_link: string | null
  section_id: number | null
  status: string
  display_order: number | null
  created_at: string
  sections?: any[] | any
}

// @ts-ignore
const { data, refresh }: { data: { value: { data: { banners: Banner[] } } }, refresh: () => Promise<void> } = await useFetch('/api/dashboard/banners')

const banners = computed(() => {
  return data.value?.data?.banners || []
})

const isLoading = ref(false)
const isRefreshing = ref(false)
const editingOrder = ref<Record<number, boolean>>({})
const orderValues = ref<Record<number, number>>({})

const handleRefresh = async () => {
  isRefreshing.value = true
  await refresh()
  isRefreshing.value = false
}

// Initialize order values
watch(banners, (newBanners) => {
  newBanners.forEach((banner: Banner) => {
    if (banner.id) {
      orderValues.value[banner.id] = banner.display_order || 0
    }
  })
}, { immediate: true })

// Handle order update
const updateOrder = async (banner: Banner) => {
  try {
    const newOrder = orderValues.value[banner.id] !== undefined
      ? orderValues.value[banner.id]
      : (banner.display_order ?? 0)
    // Create FormData as the endpoint expects it
    const formData = new FormData()
    formData.append('display_order', newOrder.toString())

    // If banner has existing image_url, include pathname to avoid image upload requirement
    if (banner.image_url) {
      formData.append('pathname', banner.image_url)
    }

    await $fetch(`/api/dashboard/banners/${banner.id}`, {
      method: 'PATCH',
      body: formData,
    })
    editingOrder.value[banner.id] = false
    await handleRefresh()
    const toast = useToast()
    toast.add({ title: 'Order updated successfully.', color: 'green' })
  }
  catch (error) {
    console.error('Error updating order:', error)
    const toast = useToast()
    toast.add({ title: 'Failed to update order.', color: 'red' })
    // Revert to original value
    orderValues.value[banner.id] = banner.display_order || 0
  }
}

const startEditingOrder = (banner: Banner) => {
  editingOrder.value[banner.id] = true
  orderValues.value[banner.id] = banner.display_order || 0
}

const cancelEditingOrder = (banner: Banner) => {
  editingOrder.value[banner.id] = false
  orderValues.value[banner.id] = banner.display_order || 0
}

// eslint-disable-next-line vue/no-expose-after-await
defineExpose({ refresh: handleRefresh })

const columns = [
  { key: 'image', label: 'Image' },
  { key: 'title', label: 'Title' },
  { key: 'section', label: 'Section' },
  { key: 'status', label: 'Status' },
  { key: 'display_order', label: 'Order' },
  { key: 'actions', label: 'Actions' },
]

const config = useRuntimeConfig()

const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  if (imageUrl.startsWith('/')) {
    return `${config.public.mediaUrl}${imageUrl}`
  }
  return config.public.mediaUrl ? `${config.public.mediaUrl}${imageUrl}` : imageUrl
}

const items = (banner: Banner) => [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {
        // This will be handled by parent component
        emit('edit', banner)
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      click: async () => {
        if (confirm('Are you sure you want to delete this banner?')) {
          try {
            await useFetch(`/api/dashboard/banners/${banner.id}`, {
              // @ts-ignore
              method: 'DELETE',
            })
            await handleRefresh()
            const toast = useToast()
            toast.add({ title: 'Banner deleted successfully.', color: 'green' })
          }
          catch (error) {
            console.error('Error deleting banner:', error)
            const toast = useToast()
            toast.add({ title: 'Failed to delete banner.', color: 'red' })
          }
        }
      },
    },
  ],
]

const emit = defineEmits(['edit'])
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-4 items-center">
        <UTooltip text="Refresh">
          <UButton
            label=""
            :trailing-icon="isRefreshing ? undefined : 'i-heroicons-arrow-path'"
            color="gray"
            :loading="isRefreshing"
            size="md"
            @click="handleRefresh"
          />
        </UTooltip>
      </div>
    </div>

    <div v-if="banners.length === 0" class="text-center py-12">
      <p class="text-gray-500">
        No banners found. Create your first banner to get started.
      </p>
    </div>

    <UTable v-else :columns="columns" :rows="banners">
      <template #image-data="{ row }">
        <div class="flex items-center">
          <img
            :src="getImageUrl(row.image_url)"
            :alt="row.title || 'Banner'"
            class="w-20 h-12 object-cover rounded border"
            onerror="this.src='/placeholder-image.jpg'"
          >
        </div>
      </template>

      <template #title-data="{ row }">
        <div>
          <p class="font-semibold">
            {{ row.title || 'Untitled Banner' }}
          </p>
          <p v-if="row.description" class="text-sm text-gray-500 line-clamp-1">
            {{ row.description }}
          </p>
        </div>
      </template>

      <template #section-data="{ row }">
        <div v-if="row.sections">
          <p class="text-sm font-medium">
            {{ Array.isArray(row.sections) && row.sections.length > 0
              ? row.sections[0].title
              : (row.sections.title || 'N/A') }}
          </p>
          <p v-if="Array.isArray(row.sections) && row.sections.length > 0 && row.sections[0].slug" class="text-xs text-gray-500">
            /{{ row.sections[0].slug }}
          </p>
        </div>
        <p v-else class="text-sm text-gray-400">
          No section linked
        </p>
      </template>

      <template #status-data="{ row }">
        <UBadge
          :label="row.status"
          :color="row.status === 'active' ? 'green' : 'gray'"
          variant="subtle"
          class="capitalize"
        />
      </template>

      <template #display_order-data="{ row }">
        <div v-if="editingOrder[row.id]" class="flex items-center gap-2">
          <UInput
            v-model.number="orderValues[row.id]"
            type="number"
            size="sm"
            class="w-20"
            @keyup.enter="updateOrder(row)"
            @keyup.escape="cancelEditingOrder(row)"
          />
          <UButton
            icon="i-heroicons-check"
            size="xs"
            color="green"
            @click="updateOrder(row)"
          />
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="gray"
            variant="ghost"
            @click="cancelEditingOrder(row)"
          />
        </div>
        <div v-else class="flex items-center gap-2 cursor-pointer group" @click="startEditingOrder(row)">
          <span class="text-sm">{{ row.display_order ?? '-' }}</span>
          <Icon
            name="i-heroicons-pencil-square"
            class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </template>

      <template #actions-data="{ row }">
        <UDropdown :items="items(row)">
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
