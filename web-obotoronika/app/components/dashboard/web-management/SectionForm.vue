<script lang="ts" setup>
import { z } from 'zod'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UInput, UTextarea } from '#components'

const emit = defineEmits(['closeModal'])

const toast = useToast()

const state = reactive({
  title: undefined,
  slug: undefined,
  parent: undefined,
  description: undefined,
})
const isLoading = ref(false)

const schema = z.object({
  title: z.string().nonempty('Title is required.'),
  slug: z
    .string({
      required_error: 'Slug is required.',
      invalid_type_error: 'Slug must be a valid string.',
    })
    .min(1, 'Slug cannot be empty.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must only contain lowercase letters, numbers, and hyphens.',
    ),
  description: z.string().optional(),
  parent: z.string().optional(),
})
type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isLoading.value = true
    const payload = await schema.parseAsync(event.data)
    await useFetch('/api/dashboard/sections', {
      method: 'POST',
      body: payload,
    })
    emit('closeModal')
    return toast.add({ title: 'Section created successfully.', color: 'green' })
  }
  catch {
    return toast.add({ title: 'Failed to create section.', color: 'red' })
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormGroup label="Title" name="title">
        <UInput v-model="state.title" size="lg" />
      </UFormGroup>
      <UFormGroup label="Slug" name="slug">
        <UInput v-model="state.slug" size="lg" />
      </UFormGroup>
      <UFormGroup label="Description" name="description">
        <UTextarea
          v-model="state.description"
          autoresize
          placeholder="Description..."
        />
      </UFormGroup>
      <UButton
        type="submit"
        size="lg"
        block
        :loading="isLoading"
      >
        Create Section
      </UButton>
    </UForm>
  </div>
</template>
