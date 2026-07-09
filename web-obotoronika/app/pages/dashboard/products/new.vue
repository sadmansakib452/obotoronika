<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { UBreadcrumb } from '#components'

useHead({
  title: 'Create Product | Obotoronika',
})

const router = useRouter()
const toast = useToast()

const isSavingDraft = ref(false)
const isSubmitting = ref(false)

const links = [
  {
    label: 'Products',
    icon: 'fluent-mdl2:product-variant',
    to: '/dashboard/products',
  },
  {
    label: 'Create product',
    icon: 'i-heroicons-plus',
  },
]

const handleSubmitForm = async (form: any) => {
  isSubmitting.value = true
  try {
    await $fetch('/api/dashboard/products', { method: 'POST', body: form })
    toast.add({
      color: 'green',
      title: 'Product Created Successfully',
      description: 'Your product has been created successfully.',
    })
    router.push('/dashboard/products')
  }
  catch (error: any) {
    const errorMessage = error?.data?.message || error.message || 'An unknown error occurred.'
    toast.add({
      color: 'red',
      title: 'Product Create Failed',
      description:
        `Unable to create the product. ${errorMessage}.`,
    })
  }
  finally {
    isSubmitting.value = false
  }
}

async function saveAsDraft(payload: any) {
  isSavingDraft.value = true
  try {
    await $fetch('/api/dashboard/products/save', { method: 'POST', body: JSON.stringify(sanitizeState(payload)) })
    toast.add({
      color: 'green',
      title: 'Draft Saved Successfully',
      description: 'Your product has been saved as a draft.',
    })
  }
  catch {
    toast.add({
      color: 'red',
      title: 'Draft Save Failed',
      description: 'Unable to save the product as a draft. Please check your credentials and try again.',
    })
  }
  finally {
    isSavingDraft.value = false
  }
}
</script>

<template>
  <div class="relative">
    <UBreadcrumb title="Create Product" :links="links" />
    <main class="mt-8">
      <DashboardProductsProductForm
        :is-saving-draft="isSavingDraft"
        :is-submitting="isSubmitting"
        @get-form-data="handleSubmitForm"
        @get-data-for-draft="saveAsDraft"
      />
    </main>
  </div>
</template>
