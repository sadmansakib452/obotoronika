<script lang="ts" setup>
import { useVariantStore } from '@/stores/variants'
import { UBreadcrumb, UButton, UIcon, UModal } from '#components'

const links = [
  {
    label: 'Products',
    icon: 'fluent-mdl2:product-variant',
    to: '/dashboard/products',
  },
  { label: 'Variants', icon: 'i-heroicons-square-3-stack-3d' },
]

// Store
const store = useVariantStore()

const isAddVariant = ref(false)

store.getVariants()

const handleCloseVariant = () => {
  isAddVariant.value = false
  store.getVariants()
}

useHead({
  title: 'Manage Variants | Obotoronika',
})
</script>

<template>
  <div>
    <div class="flex justify-between">
      <UBreadcrumb title="Products" :links="links" />
      <UButton
        label="Add Variant"
        size="lg"
        icon="i-heroicons-plus"
        block
        class="w-40 h-fit"
        color="black"
        @click="isAddVariant = true"
      />
    </div>
    <div>
      <Variants :items="store.variants.data" :is-loading="store.variants.isLoading" @refresh="store.getVariants" />
    </div>
    <UModal
      v-model="isAddVariant"
      :ui="{ width: 'w-full sm:max-w-lg', container: 'items-center' }"
    >
      <div class="p-4">
        <div class="flex justify-between">
          <h3 class="font-Homenaje text-3xl obotoronika-title">
            Add Variant
          </h3>
          <button @click="isAddVariant = false">
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>
        <VariantsAddVariant @close="handleCloseVariant" />
      </div>
    </UModal>
  </div>
</template>
