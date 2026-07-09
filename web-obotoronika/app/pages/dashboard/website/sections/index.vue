<script setup lang="ts">
import { UBreadcrumb, UButton, UCard, UModal } from '#components'

const links = [{
  label: 'Website Management',
  icon: 'material-symbols:web',
  to: '/dashboard/categories',
}, {
  label: 'Manage Sections',
  icon: 'i-heroicons-view-columns',
}]

const isOpen = ref(false)
const childRef = ref()

const closeModalAndRefresh = () => {
  isOpen.value = false
  childRef.value?.refresh()
}

useHead({
  title: 'Manage Sections | Obotoronika',
})
definePageMeta({
  roles: ['admin', 'super_admin'],
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center gap-6">
      <UBreadcrumb title="Manage Sections" :links="links" />
      <UButton
        label="Add Section"
        icon="i-heroicons-plus"
        block
        class="w-40 h-fit"
        color="black"
        @click="isOpen = true"
      />
    </div>
    <main class="mt-8">
      <DashboardWebManagementSectionManagement ref="childRef" />
    </main>
    <UModal v-model="isOpen" :ui="{ width: 'w-full sm:max-w-lg' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white obotoronika-text-color">
              Create New Section
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen=false"
            />
          </div>
        </template>
        <DashboardWebManagementSectionForm @close-modal="closeModalAndRefresh" />
      </UCard>
    </UModal>
  </div>
</template>
