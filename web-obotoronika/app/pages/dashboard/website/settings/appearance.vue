<script lang="ts" setup>
import { z } from 'zod'
import { UButton, UForm, UFormGroup, UInput, USelectMenu } from '#components'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'

// @ts-ignore
setPageLayout('dashboard-website-settings-navigator')
useHead({
  title: 'Appearance | Obotoronika',
})

const layouts = [
  {
    id: 'abc',
    name: 'Hydrogen',
  },
]

const schema = z.object({
  primary_color: z.string({ required_error: 'Primary color is required.' }),
  layout: z.string({ required_error: 'Layout is required.' }),
})

type Schema = z.output<typeof schema>
const state = reactive({
  primary_color: undefined as string | undefined,
})

async function handleUpdate(event: FormSubmitEvent<Schema>) {
  fetch('/api/dashboard/settings/website/general', { method: 'POST', body: event.data })
}
</script>

<template>
  <CustomCard>
    <div class="mb-4">
      <h3 class="font-Homenaje text-3xl obotoronika-title">
        Appearance
      </h3>
      <p class="obotoronika-muted-text text-sm">
        Customize your store's look and feel, including colors, fonts, and layout.
      </p>
    </div>
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="handleUpdate"
    >
      <div class="flex gap-4 w-full mb-8 flex-col lg:flex-row">
        <UFormGroup
          label="Primary Color"
          name="primary_color"
          size="lg"
          class="w-full"
        >
          <UInput v-model="state.primary_color" placeholder="Primary Color" />
        </UFormGroup>
        <UFormGroup label="Select Layout" name="language" class="w-full">
          <USelectMenu
            v-model.number="state.layout"
            :options="layouts"
            value-attribute="id"
            option-attribute="name"
            placeholder="Select..."
            class="w-full"
            size="lg"
          />
        </UFormGroup>
      </div>
      <UButton
        type="submit"
        size="lg"
        block
        class="w-fit ml-auto"
      >
        Save Changes
      </UButton>
    </UForm>
  </CustomCard>
</template>
