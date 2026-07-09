<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
const route = useRoute()
const toast = useToast()

const queryString = route.query

// @ts-ignore
const { data, error }: any = await useFetch('/api/shipping', { query: queryString })

if (error.value) {
  toast.add({
    title: 'Error',
    description: `${
      error.value.data?.message
      ?? 'Something went wrong. Please try again later.'
    }`,
    color: 'red',
  })
}
</script>

<template>
  <div class="w-11/12 lg:w-2/3 mx-auto my-20 flex flex-col lg:grid lg:grid-cols-12 gap-4">
    <ShippingProducts :products="data?.data?.products ?? []" />
    <ShippingSummary
      :can-proceed="error ? true : false"
      :products="data?.data?.products ?? []"
    />
  </div>
</template>
