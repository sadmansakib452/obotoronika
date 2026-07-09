<script lang="ts" setup>
import { UButton, UCard, UModal } from '#components'

// Props
const props = defineProps<{
  order: any
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'success'])

// Return reasons
const returnReasons = [
  { value: 'defective', label: 'Product is defective/damaged' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'size_issue', label: 'Size/fit issue' },
  { value: 'quality_issue', label: 'Quality not as expected' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other reason' },
]

// Form state
const form = ref({
  type: 'return',
  reason: '',
  description: '',
  images: [] as string[],
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Reset form when modal opens/closes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    form.value = {
      type: 'return',
      reason: '',
      description: '',
      images: [],
    }
    errorMessage.value = ''
    successMessage.value = ''
  }
})

// Submit return request
const submitReturn = async () => {
  // Validation
  if (!form.value.reason) {
    errorMessage.value = 'Please select a reason for the return'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await $fetch('/api/returns', {
      method: 'POST',
      body: {
        order_id: props.order.id,
        type: form.value.type,
        reason: form.value.reason,
        description: form.value.description || undefined,
        images: form.value.images || undefined,
      },
    })

    if (response.success) {
      successMessage.value = 'Return request submitted successfully!'
      setTimeout(() => {
        emit('success', response.data.return_request)
        emit('close')
      }, 1500)
    }
  }
  catch (error: any) {
    errorMessage.value = error.data?.message || 'Failed to submit return request'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UModal :model-value="isOpen" @update:model-value="emit('close')">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h4 class="text-lg font-semibold">
            Request Return
          </h4>
          <UButton variant="ghost" size="sm" @click="emit('close')" />
        </div>
      </template>

      <div class="space-y-4">
        <!-- Order Info -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <p class="text-sm obotoronika-muted-text">
            Order
          </p>
          <p class="font-medium">
            #{{ order?.order_id }}
          </p>
          <p class="text-sm obotoronika-muted-text mt-1">
            Amount: ৳{{ order?.total_amount }}
          </p>
        </div>

        <!-- Return Type -->
        <div>
          <label class="block text-sm font-medium mb-2">Return Type</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.type"
                type="radio"
                value="return"
                class="text-primary"
              >
              <span>Return (after delivery)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.type"
                type="radio"
                value="cancellation"
                class="text-primary"
              >
              <span>Cancel (before delivery)</span>
            </label>
          </div>
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-sm font-medium mb-2">
            Reason for Return <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.reason"
            class="w-full border obotoronika-border-color rounded-md px-3 py-2 bg-transparent"
          >
            <option value="">
              Select a reason
            </option>
            <option v-for="r in returnReasons" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium mb-2">
            Additional Details (Optional)
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full border obotoronika-border-color rounded-md px-3 py-2 bg-transparent"
            placeholder="Describe the issue in more detail..."
          />
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="text-red-500 text-sm bg-red-50 dark:bg-red-900 p-3 rounded-lg">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="text-green-500 text-sm bg-green-50 dark:bg-green-900 p-3 rounded-lg">
          {{ successMessage }}
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-2 pt-4">
          <UButton
            variant="outline"
            @click="emit('close')"
          >
            Cancel
          </UButton>
          <UButton
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="submitReturn"
          >
            Submit Request
          </UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template>
