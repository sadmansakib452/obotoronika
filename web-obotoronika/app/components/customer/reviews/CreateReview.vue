<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UTextarea } from '#components'

interface Props {
  id: number
  productId: string
  orderId: number
}

const emit = defineEmits(['close'])
const props = defineProps<Props>()
const config = useRuntimeConfig()
const reviewStore = useReviewStore()

// @ts-ignore
const { data } = await useFetch(`/api/reviews/${props.id}/${props.productId}`)

const state = reactive({
  rating: 0,
  comment: '',
})

const isLoading = ref(false)

async function onSubmit(_event: FormSubmitEvent) {
  isLoading.value = true
  console.log(props)
  try {
    await $fetch('/api/reviews/submit', {
      method: 'POST',
      body: {
        order_item_id: props.id,
        product_id: props.productId,
        order_id: props.orderId,
        rating: state.rating,
        comment: state.comment,
      },
    })

    emit('close')
    await reviewStore.getToReviews()

    // Optionally reset the form
    state.comment = ''
    state.rating = 0
  }
  catch (error) {
    console.error('Error submitting review:', error)
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="mt-4">
    <div class="flex gap-2 mb-4">
      <img
        :src="`${config.public.mediaUrl}${data.data.product.thumbnail}`"
        alt="Product"
        loading="lazy"
        class="w-16 h-16 rounded-md"
      >
      <div>
        <h1 class="font-Homenaje font-semibold obotoronika-title truncate tracking-wide">
          {{ data.data.product.title }}
        </h1>
        <div
          v-for="(variant, index) in data.data.variants"
          :key="index"
          class="obotoronika-muted-text"
        >
          <span
            v-if="variant && Object.keys(variant)[0].includes('color')"
            class="text-xs block"
          >
            Color: {{ variant[Object.keys(variant)[0]].label }}
          </span>
          <span
            v-if="variant && Object.keys(variant)[0].includes('size')"
            class="text-xs block"
          >
            Size: {{ variant[Object.keys(variant)[0]].label }}
          </span>
        </div>
      </div>
    </div>

    <UForm :state="state" class="space-y-4" @submit="onSubmit">
      <!-- Dynamic Rating Stars -->
      <div class="-mx-0.5 mb-2.5 flex cursor-pointer">
        <template v-for="index in 5" :key="index">
          <Icon
            :name="index <= state.rating ? 'line-md:star-filled' : 'line-md:star'"
            class="text-4xl transition"
            :class="index <= state.rating ? 'text-orange-500 fill-orange-500' : 'text-gray-300 fill-gray-300'"
            @click="state.rating = index"
          />
        </template>
      </div>

      <!-- Optional Comment Field -->
      <UFormGroup label="Comment" name="comment">
        <UTextarea v-model="state.comment" placeholder="Write an optional comment..." />
      </UFormGroup>

      <!-- Submit Button -->
      <UButton
        type="submit"
        block
        :disabled="!state.rating"
        :loading="isLoading"
      >
        Submit
      </UButton>
    </UForm>
  </div>
</template>
