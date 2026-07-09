<script setup lang="ts">
import draggable from 'vuedraggable'
import { GripVertical, X } from 'lucide-vue-next'
import { ref, watch, computed } from 'vue'
import { UBadge, UButton, UCheckbox, UDropdown } from '#components'

// Define the type for a section
interface Section {
  id: number
  title: string
  slug: string
  status: string
  active_position: number | null
  banner_count?: number
}

// @ts-ignore
const { data, refresh }: { data: { value: { data: { sections: Section[] } } }, refresh: () => Promise<void> } = await useFetch('/api/dashboard/sections')

// Extract sections from the API response
const allSections = ref<Section[]>([])

// Store checkbox states individually
const checkboxStates = ref<Record<number, boolean>>({})

// The list shown in the draggable area
const list = ref<Section[]>([])
const isLoading = ref(false)
const isRefreshing = ref(false)

// Store the initial state of the list for comparison
const initialList = ref<Section[]>([])

// Function to initialize data after fetching
const initializeData = () => {
  const sections = data.value?.data?.sections || []
  allSections.value = sections.map(section => ({
    id: section.id,
    title: section.title,
    slug: section.slug,
    status: section.status,
    active_position: section.active_position,
    banner_count: section.banner_count || 0,
  }))

  // Initialize the list and initialList with active sections
  const activeSections = allSections.value
    .filter(section => section.status === 'active' && section.active_position !== null)
    .sort((a, b) => (a.active_position ?? 0) - (b.active_position ?? 0))
  list.value = [...activeSections]
  initialList.value = [...activeSections]

  // Initialize checkbox states based on the initial list
  checkboxStates.value = Object.fromEntries(
    allSections.value.map(section => [section.id, initialList.value.some(item => item.id === section.id)]),
  )
}

// Initialize data on component mount
initializeData()

// Watch `allSections` and update the list when data changes
watch(
  allSections,
  (newSections) => {
    const activeSections = newSections
      .filter(section => section.status === 'active' && section.active_position !== null)
      .sort((a, b) => (a.active_position ?? 0) - (b.active_position ?? 0))
    list.value = [...activeSections]
    initialList.value = [...activeSections]

    // Update checkbox states based on the new initial list
    checkboxStates.value = Object.fromEntries(
      newSections.map(section => [section.id, initialList.value.some(item => item.id === section.id)]),
    )
  },
  { immediate: true },
)

// Sync checkbox selection to the list
watch(
  checkboxStates,
  (states) => {
    const selectedSections = allSections.value.filter(section => states[section.id])
    const activeSections = list.value.filter(section => section.status === 'active')
    const nonActiveSections = selectedSections.filter(section => section.status !== 'active')
    list.value = [...activeSections, ...nonActiveSections]
  },
  { deep: true },
)

// Remove an item from the list and update checkbox state
const removeItem = (id: number) => {
  checkboxStates.value[id] = false
  list.value = list.value.filter(section => section.id !== id)
}

// Check if the list has been modified
const isModified = computed(() => {
  if (list.value.length !== initialList.value.length) return true
  return list.value.some((section, index) => section.id !== initialList.value[index]?.id)
})

// Handle save functionality
async function handleSave() {
  try {
    isLoading.value = true
    await useFetch('/api/dashboard/sections/manage', {
      // @ts-ignore
      method: 'PATCH',
      body: {
        sections: list.value.map((section, index) => ({
          id: section.id,
          index,
        })),
      },
    })
    // Update the initial list after saving
    initialList.value = [...list.value]
    alert('Changes saved successfully!')
  }
  catch (error) {
    console.error('Error saving sections:', error)
    alert('Failed to save changes. Please try again.')
  }
  finally {
    isLoading.value = false
  }
}

// Handle cancel functionality
const handleCancel = () => {
  list.value = [...initialList.value]
  // Reset checkbox states based on the initial list
  checkboxStates.value = Object.fromEntries(
    allSections.value.map(section => [section.id, initialList.value.some(item => item.id === section.id)]),
  )
}

// Handle refresh functionality
const handleRefresh = async () => {
  try {
    isRefreshing.value = true
    await refresh() // Call the refresh function to fetch new data
    initializeData() // Reinitialize the data and update the UI
    alert('Data refreshed successfully!')
  }
  catch (error) {
    console.error('Error refreshing data:', error)
    alert('Failed to refresh data. Please try again.')
  }
  finally {
    isRefreshing.value = false
  }
}

const items = (id: number) => [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      to: `/dashboard/categories/${id}/edit`,
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      click: async () => {
        try {
          await useFetch(`/api/dashboard/sections/${id}`, {
            // @ts-ignore
            method: 'DELETE',
          })
          handleRefresh()
        }
        catch (error) {
          console.error('Error deleting section:', error)
          alert('Failed to delete the section. Please try again.')
        }
      },
    },
  ],
]

// eslint-disable-next-line vue/no-expose-after-await
defineExpose({ refresh: handleRefresh })
</script>

<template>
  <div class="section-management">
    <!-- Available Sections -->
    <div class="available-sections">
      <h1 class="text-lg font-bold mb-4">
        Available Sections
      </h1>
      <ul class="space-y-2">
        <li v-for="section in allSections" :key="section.id" class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <UCheckbox
              v-model="checkboxStates[section.id]"
              color="primary"
              :label="section.title"
            />
            <UBadge
              v-if="section.banner_count && section.banner_count > 0"
              :label="`${section.banner_count} banner${section.banner_count > 1 ? 's' : ''}`"
              color="blue"
              variant="subtle"
              size="sm"
            />
          </div>
          <UDropdown :items="items(section.id)">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-horizontal-20-solid"
              class="p-0"
            />
          </UDropdown>
        </li>
      </ul>
    </div>

    <!-- Selected Sections -->
    <div class="selected-sections">
      <h1 class="text-lg font-bold mb-4">
        Selected Sections
      </h1>
      <client-only>
        <draggable
          :list="list"
          item-key="id"
          class="list-group space-y-2"
          ghost-class="ghost"
          handle=".drag-handle"
        >
          <template #item="{ element }">
            <div
              class="list-group-item flex justify-between items-center p-3 border rounded shadow-sm"
            >
              <div class="flex items-center gap-2">
                <button class="cursor-move drag-handle">
                  <GripVertical :size="16" />
                </button>
                <span>{{ element.title }}</span>
                <UBadge
                  v-if="element.banner_count && element.banner_count > 0"
                  :label="`${element.banner_count} banner${element.banner_count > 1 ? 's' : ''}`"
                  color="blue"
                  variant="subtle"
                  size="sm"
                />
              </div>
              <button @click="removeItem(element.id)">
                <X :size="16" class="text-red-500" />
              </button>
            </div>
          </template>
        </draggable>
      </client-only>
    </div>
  </div>
  <div
    class="bg-white border-t border-dashed fixed left-0 bottom-0 w-full flex justify-end p-2.5 dark:bg-[#111827] dark:border-theme-border"
  >
    <div class="flex gap-2">
      <UButton
        type="button"
        label="Cancel"
        size="lg"
        color="white"
        :disabled="!isModified"
        @click="handleCancel"
      />
      <UButton
        type="submit"
        label="Save"
        size="lg"
        :disabled="!isModified"
        :loading="isLoading"
        @click="handleSave"
      />
    </div>
  </div>
</template>

<style scoped>
@import url("./index.css");
.list-group-item {
  transition: all 0.2s ease;
}
.ghost {
  opacity: 0.5;
}
</style>
