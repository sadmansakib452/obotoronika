<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
const route = useRoute()
const slug = route.params.slug as string

// @ts-ignore
const { data }: any = await useFetch(`/api/products/${slug}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})

const product = data.value?.data as Product
const config = useRuntimeConfig()

const images = [] as Image[]

images.push({
  url: `${config.public.mediaUrl}${product.thumbnail}`,
})

// i have more images on product.files i  want to store in images
product.files?.forEach((file: string) => {
  images.push({
    url: `${config.public.mediaUrl}${file}`,
  })
})

onErrorCaptured((err, instance) => {
  console.error('[PRODUCT-DETAIL ERROR]', err, 'component:', instance?.type?.__name || instance?.$options?.name || 'unknown')
  return false // prevent propagation
})

const offerPercentage = computed(() => {
  if (product.offer_price && product.price) {
    return ((product.price - product.offer_price) / product.price) * 100
  }
  return 0
})

useHead({
  title: `${product.title} | Obotoronika`,
})
</script>

<template>
  <div class="w-11/12 mx-auto mt-8 lg:w-11/12 3xl:w-10/12">
    <div class="@container">
      <div class="@3xl:grid @3xl:grid-cols-12">
        <div class="col-span-5 mb-7 @container @lg:mb-10 @3xl:pe-6 @7xl:pe-10">
          <ProductDetailsImageGallery :images="images" />
        </div>
        <div class="col-span-5 @container @lg:mb-10 @3xl:pe-6 @7xl:pe-10">
          <h2 class="text-3xl font-semibold font-Homenaje tracking-wider @6xl:text-4xl obotoronika-title">
            {{ product.title }}
          </h2>
          <!-- <p class="rizzui-text-p font-normal text-base obotoronika-text">Casio Classic Watch</p> -->
          <div class="mb-1.5 mt-2 flex items-end font-lexend text-base">
            <div class="-mb-0.5 obotoronika-title">
              Tk {{ product.offer_price?.toFixed(2) || product.price.toFixed(2) }} BDT
            </div>
            <del v-if="product.offer_price" class="ps-1.5 text-sm obotoronika-muted-text">Tk {{ product.price }} BDT</del>
            <div v-if="product.offer_price" class="ps-1.5 text-red-500 text-xs">
              ({{ offerPercentage.toFixed(2) }}% OFF)
            </div>
          </div>
          <p class="font-medium text-green-800 text-xs">
            Inclusive of all taxes
          </p>
          <ProductDetailsVariants :variants="product.variants" />
          <ProductDetailsActionButtons :id="product.id" :merchant-id="product.merchant_id" :product="product" />
        </div>
        <div class="col-span-2 @container">
          <ProductDetailsDeliveryOptions />
        </div>
      </div>
      <div class="@3xl:grid @3xl:grid-cols-12 mb-20">
        <div class="col-span-6 @container @lg:pe-10 @3xl:pe-0">
          <ProductDetailsDescription :desc="product.description" :tags="product.tags ?? []" />
        </div>
        <div class="col-span-6 @container @lg:ps-10 @3xl:ps-0">
          <ProductDetailsRatingReviews />
        </div>
      </div>
      <ProductDetailsRelated :slug="slug" />
    </div>
  </div>
</template>

<style scoped></style>
