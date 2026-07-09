<script setup lang="ts">
import { UBreadcrumb, UButton, UCard, UModal } from '#components'

const links = [{
  label: 'Website Management',
  icon: 'material-symbols:web',
  to: '/dashboard/website/sections',
}, {
  label: 'Manage Banners',
  icon: 'i-heroicons-photo',
}]

const isOpen = ref(false)
const childRef = ref()
const editingBanner = ref<any>(null)

const closeModalAndRefresh = () => {
  isOpen.value = false
  editingBanner.value = null
  childRef.value?.refresh()
}

const handleEdit = (banner: any) => {
  editingBanner.value = banner
  isOpen.value = true
}

useHead({
  title: 'Manage Banners | Obotoronika',
})
definePageMeta({
  roles: ['admin', 'super_admin', 'manager'],
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center gap-6">
      <UBreadcrumb title="Manage Banners" :links="links" />
      <UButton
        label="Add Banner"
        icon="i-heroicons-plus"
        block
        class="w-40 h-fit"
        color="black"
        @click="() => { editingBanner = null; isOpen = true }"
      />
    </div>
    <main class="mt-8">
      <DashboardWebManagementBannerManagement ref="childRef" @edit="handleEdit" />
    </main>
    <UModal v-model="isOpen" :ui="{ width: 'w-full sm:max-w-lg' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white obotoronika-text-color">
              {{ editingBanner ? 'Edit Banner' : 'Create New Banner' }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="closeModalAndRefresh"
            />
          </div>
        </template>
        <div class="h-[70vh] overflow-y-auto pr-4">
          <DashboardWebManagementBannerForm :banner="editingBanner" @close-modal="closeModalAndRefresh" />
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<style>
</style>
