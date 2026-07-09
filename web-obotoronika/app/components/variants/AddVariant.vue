<script setup lang="ts">
import { z } from 'zod'
// @ts-ignore
import utils from '@@/shared/utils'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UIcon, UInput, USelectMenu, UTextarea } from '#components'

const emit = defineEmits(['close'])

const schema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters'),
  field_type: z.string({ required_error: 'Field type is required' }),
  description: z.string().optional(),
})

type Schema = z.output<typeof schema>

const state = reactive({
  name: undefined,
  field_type: undefined,
  description: undefined,
})
const isLoading = ref(false)

const key = computed(() => utils.toKey(state.name || ''))

const fields: any = [
  {
    label: 'Color',
    value: 'color',
    icon: 'i-heroicons-swatch',
  },
  {
    label: 'Size',
    value: 'size',
    icon: 'i-heroicons-scale',
  },
]

const selected = ref()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isLoading.value = true
    await fetch('/api/dashboard/variants', {
      method: 'post',
      body: JSON.stringify({
        name: event.data.name,
        key: `${event.data.field_type}.${key.value}`,
        field_type: event.data.field_type,
        description: event.data.description,
      }),
    })
  }
  // eslint-disable-next-line no-empty
  catch (error) {}
  finally {
    isLoading.value = false
    emit('close')
  }
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4 mt-4"
    @submit="onSubmit"
  >
    <UFormGroup label="Name" name="name">
      <UInput v-model="state.name" />
    </UFormGroup>
    <p class="obotoronika-muted-text text-sm">
      <span class="font-medium obotoronika-text">Key: </span>
      <span v-if="key">{{ key }}
        <button class="underline text-primary ml-1">Edit</button></span>
    </p>
    <UFormGroup label="Field Type" name="field_type">
      <USelectMenu
        v-model="state.field_type"
        searchable
        searchable-placeholder="Search a field..."
        class="w-full"
        placeholder="Select a field"
        :options="fields"
        size="lg"
        option-attribute="label"
        value-attribute="value"
      >
        <template #option="{ option: item }">
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span class="truncate">{{ item.label }}</span>
        </template>
      </USelectMenu>
    </UFormGroup>
    <UFormGroup label="Description" name="description">
      <UTextarea v-model="state.description" />
    </UFormGroup>

    <UButton type="submit" :loading="isLoading">
      Submit
    </UButton>
  </UForm>
</template>
