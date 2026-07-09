<script lang="ts" setup>
import { UButton, UIcon, UModal } from '#components'

type Item = {
  id: number
  product_id: string
  order_id: number
  status: string
  title: string
  thumbnail: string
  price: number
}

interface Props {
  toReview: boolean
  item: Item
}

const config = useRuntimeConfig()

const props = defineProps<Props>()

const isReviewAdd = ref(false)
const ID = ref<null | number>(null)
const productID = ref<null | string>(null)
const orderID = ref<null | number>(null)

const handleCreateReview = (item: Item) => {
  ID.value = item.id
  productID.value = item.product_id
  orderID.value = item.order_id
  isReviewAdd.value = true
}

const handleClose = () => {
  ID.value = null
  productID.value = null
  orderID.value = null
  isReviewAdd.value = false
}
</script>

<template>
  <div class="shadow p-3 rounded-md flex justify-between items-center">
    <div class="flex gap-2">
      <div class="w-12 h-12">
        <img
          :src="`${config.public.mediaUrl}${props.item.thumbnail}`"
          alt=""
          class="w-full h-full rounded-md"
        >
      </div>
      <div>
        <h3 class="font-semibold text-lg tracking-wide font-Homenaje obotoronika-text">
          {{ props.item.title }}
        </h3>
        <div v-for="(variant, index) in props.item.variants" :key="index" class="obotoronika-muted-text">
          <span
            v-if="variant && Object.keys(variant)[0].includes('color')"
            class="text-xs block"
          >Color: {{ variant[Object.keys(variant)[0]].label }}</span>
          <span
            v-if="variant && Object.keys(variant)[0].includes('size')"
            class="text-xs block"
          >Size: {{ variant[Object.keys(variant)[0]].label }}</span>
        </div>
        <div v-if="!props.toReview">
          <template v-for="index in 5" :key="index">
            <Icon v-if="index <= props.item.rating" name="line-md:star-filled" class="w-4 fill-orange-500 text-orange-500" />
            <Icon v-else name="line-md:star" class="w-4 fill-gray-300 text-gray-500" />
          </template>
          <p class="text-sm obotoronika-muted-text">
            {{ props.item.comment }}
          </p>
        </div>
      </div>
    </div>
    <div v-if="props.toReview">
      <UButton @click="handleCreateReview(props.item)">
        Review
      </UButton>
    </div>
    <UModal
      v-model="isReviewAdd"
      :ui="{ width: 'w-full sm:max-w-lg', container: 'items-center' }"
    >
      <div class="p-4">
        <div class="flex justify-between">
          <h3 class="font-Homenaje text-3xl obotoronika-title">
            Write Review
          </h3>
          <button @click="handleClose">
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>
        <CustomerReviewsCreateReview
          :id="ID"
          :product-id="productID"
          :order-id="orderID"
          @close="isReviewAdd=false"
        />
      </div>
    </UModal>
  </div>
</template>
