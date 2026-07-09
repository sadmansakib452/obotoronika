<script lang="ts" setup>
const route = useRoute()
const slug = route.params.slug as string

const store = useProductsStore()

const page = ref(1)
const showLoadMore = ref(true)

const query = computed(() => ({
  page: page.value,
  perPage: 20,
}))

// Check if products for the current slug are already loaded
if (!store.products[slug]) {
  // @ts-ignore
  await store.fetchProducts(slug, query)
}

const section = store.products[slug]

// Hide "Load More" button if all products are already loaded
if (section?.meta && section?.meta.page >= section?.meta.totalPages) {
  showLoadMore.value = false
}

useHead({
  title: `${section?.title} | Obotoronika`,
})

// Load more products
const loadMore = async () => {
  page.value += 1
  await store.fetchProducts(slug, query)

  const updatedSection = store.products[slug]
  if (updatedSection?.meta && updatedSection?.meta.page >= updatedSection?.meta.totalPages) {
    showLoadMore.value = false
  }
}
</script>

<template>
  <div class="wrapper">
    <section class="products">
      <AtomsSectionTitle :title="section?.title ?? ''" :description="section?.description ?? ''" />
      <div class="products-lists">
        <AtomsProduct v-for="(item) in section?.products ?? []" :key="item.id" :product="item" />
      </div>
      <button v-if="showLoadMore" class="mx-auto btn-2 px-4 py-2 mt-10" @click="loadMore">
        Load More
      </button>
    </section>
  </div>
</template>
