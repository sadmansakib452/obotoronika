<script setup>
import { ref, computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'

const review = ref({
  customer: {
    avatar: '',
    name: 'John Doe',
  },
  date: new Date(),
  message: 'This is a sample review message. The product quality is amazing!',
  attachment: [
    'https://plus.unsplash.com/premium_photo-1675896084254-dcb626387e1e?q=80&w=2135&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://plus.unsplash.com/premium_photo-1675896042153-9dc08f9c9599?q=80&w=2135&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  ],
})

const formattedDate = computed(() => {
  if (!review.value.date) return ''
  return formatDistanceToNow(new Date(review.value.date), { addSuffix: true })
})
</script>

<template>
  <div class="border-t border-border-200 py-6 md:flex md:items-start">
    <div class="shrink-0 md:w-40 md:pe-4">
      <h6 class="pb-1.5 text-base font-semibold md:font-medium obotoronika-title">
        {{ review.customer.name }}
      </h6>
      <p class="text-xs md:text-sm obotoronika-muted-text">
        {{ formattedDate }}
      </p>
    </div>
    <div class="w-full pt-4 md:pt-1">
      <div class="-mx-0.5 mb-2.5 flex">
        <template v-for="index in 5" :key="index">
          <Icon v-if="index <= 3" name="line-md:star-filled" class="w-4 fill-orange-500 text-orange-500" />
          <Icon v-else name="line-md:star" class="w-4 fill-gray-300 text-gray-500" />
        </template>
      </div>
      <p class="leading-[1.85] obotoronika-text">
        {{ review.message }}
      </p>
      <div v-if="review.attachment.length" class="grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-3 pt-2.5">
        <div
          v-for="(item, index) in review.attachment"
          :key="`review-key-${index}`"
          class="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded bg-gray-100"
        >
          <img :src="item" alt="Review attachment" class="h-full w-full object-cover">
        </div>
      </div>
    </div>
  </div>
</template>
