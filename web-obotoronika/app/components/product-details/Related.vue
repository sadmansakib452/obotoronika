<script lang="ts" setup>
const props = defineProps<{
  slug: string
}>()

// @ts-ignore
const { data }: any = await useFetch(`/api/products/${props.slug}/recommendations`)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">
      You may also like
    </h1>
    <section class="products !my-6">
      <div class="products-lists !w-full">
        <AtomsProduct
          v-for="(item) in data?.recommendations ?? []"
          :key="item.id"
          :product="item"
        />
      </div>
    </section>
  </div>
</template>
