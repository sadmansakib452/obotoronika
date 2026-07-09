<script lang="ts" setup>
import { UBreadcrumb } from '#components'

const route = useRoute()
const toast = useToast()
const router = useRouter()

const productID = route.params.id
const isSavingDraft = ref(false)
const isSubmitting = ref(false)

const links = [
  {
    label: 'Products',
    icon: 'fluent-mdl2:product-variant',
    to: '/dashboard/products',
  },
  {
    label: 'Edit product',
    icon: 'i-heroicons-pencil-square-20-solid',
  },
]

// @ts-ignore
const { data, error } = await useFetch(`/api/dashboard/products/${productID}`)

const fetchedData = data?.value as unknown as SuccessResponse

if (error.value) {
  toast.add({
    color: 'red',
    title: 'Failed to fetch product',
    description:
      'Unable to fetch the product. Please check your credentials and try again.',
  })
}

const handleSubmitForm = async (form: any) => {
  isSubmitting.value = true
  try {
    if (productID === 'new') {
      await $fetch('/api/dashboard/products', { method: 'POST', body: form })
    }
    else {
      await $fetch(`/api/dashboard/products/${productID}`, {
        method: 'PATCH',
        body: form,
      })
    }
    toast.add({
      color: 'green',
      title: 'Product Updated Successfully',
      description: 'Your product has been updated successfully.',
    })
    router.push('/dashboard/products')
  }
  catch (error: any) {
    const errorMessage = error?.data?.message || error.message || 'An unknown error occurred.'
    toast.add({
      color: 'red',
      title: 'Product Update Failed',
      description:
        `Unable to update the product. ${errorMessage}.`,
    })
  }
  finally {
    isSubmitting.value = false
  }
}

async function saveAsDraft(payload: any) {
  isSavingDraft.value = true
  try {
    // Check if product.id exists to determine which route to use
    const productId = fetchedData?.data?.id || productID

    if (productId && productId !== 'new') {
      // Product exists, use PATCH to update
      await $fetch(`/api/dashboard/products/${productId}/save`, {
        method: 'PATCH',
        body: sanitizeState(payload),
      })
    }
    else {
      // New product, use POST to create
      await $fetch('/api/dashboard/products/save', {
        method: 'POST',
        body: JSON.stringify(sanitizeState(payload)),
      })
    }
    router.push('/dashboard/products')
    toast.add({
      color: 'green',
      title: 'Product Saved as Draft Successfully',
      description: 'Your product has been saved as a draft.',
    })
  }
  catch (error: any) {
    const errorMessage = error?.data?.message || error.message || 'An unknown error occurred.'
    toast.add({
      color: 'red',
      title: 'Product Save as Draft Failed',
      description:
        `Unable to save the product as a draft. ${errorMessage}`,
    })
  }
  finally {
    isSavingDraft.value = false
  }
}

useHead({
  title: 'Edit product | Obotoronika',
})
</script>

<template>
  <div class="relative">
    <UBreadcrumb title="Create Product" :links="links" />
    <main class="mt-8">
      <DashboardProductsProductForm
        :is-saving-draft="isSavingDraft"
        :is-submitting="isSubmitting"
        :product="fetchedData?.data || {}"
        @get-form-data="handleSubmitForm"
        @get-data-for-draft="saveAsDraft"
      />
    </main>
  </div>
</template>
