<script lang="ts" setup>
import { UButton } from '#components'

definePageMeta({
  roles: ['customer', 'super_admin'],
})

const reviewTab = ref<'history' | 'to-review'>('to-review')

const tabs = [
  { label: 'To Review', value: 'to-review' },
  { label: 'Review History', value: 'history' },
]
</script>

<template>
  <div class="w-11/12 mx-auto my-8 lg:ml-4 lg:w-10/12">
    <div class="lg:w-1/2">
      <h3 class="font-Homenaje text-3xl obotoronika-title">
        Reviews
      </h3>
      <p class="obotoronika-muted-text text-sm">
        Share your experience and help others make informed choices.
      </p>
    </div>
    <div class="flex items-center gap-2 mt-6">
      <UButton
        v-for="tab in tabs"
        :key="tab.value"
        :color="reviewTab === tab.value ? 'primary' : 'gray'"
        @click="reviewTab = tab.value"
      >
        {{ tab.label }}
      </UButton>
    </div>
    <div class="mt-4">
      <CustomerReviewsToReview v-if="reviewTab === 'to-review'" />
      <CustomerReviews v-else />
    </div>
  </div>
</template>
