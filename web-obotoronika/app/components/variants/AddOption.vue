<!-- eslint-disable no-empty -->
<!-- eslint-disable vue/prop-name-casing -->
<script setup lang="ts">
import { z } from 'zod'
// @ts-ignore
import utils from '@@/shared/utils'
// @ts-ignore
import Color from './fields/Color.vue'
// @ts-ignore
import Size from './fields/Size.vue'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UInput } from '#components'

const emit = defineEmits(['close'])

const props = defineProps<{
  field_type: string
  option_id: number
  variant_id: number
}>()

const componentMap: Record<string, any> = {
  color: Color,
  size: Size,
}

const schema = z.object({
  label: z.string().optional(),
  value: z.string({ required_error: 'Value is required' }),
})

type Schema = z.output<typeof schema>

const state = reactive({
  label: undefined,
  value: undefined,
})
const isLoading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const url = props.option_id ? `/api/dashboard/variants/options/${props.option_id}` : `/api/dashboard/variants/${props.variant_id}`
    const method = props.option_id ? 'PUT' : 'POST'

    const payload = {
      label: state.label,
      value: state.value,
      variant_id: props.variant_id,
    }

    isLoading.value = true
    await fetch(url, {
      method,
      body: JSON.stringify(payload),
    })
  }
  catch (error) {
  }
  finally {
    isLoading.value = false
    emit('close')
  }
}

onMounted(async () => {
  if (props.option_id) {
    const response = await fetch(
      `/api/dashboard/variants/options/${props.option_id}`,
    )
    const { data } = await response.json()
    if (data.label) {
      state.label = data.label
    }
    state.value = data.value
  }
})
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4 mt-4"
    @submit="onSubmit"
  >
    <UFormGroup label="Label" name="label">
      <UInput v-model="state.label" />
    </UFormGroup>
    <UFormGroup label="Value" name="value">
      <component :is="componentMap[props.field_type]" v-model="state.value" />
    </UFormGroup>
    <UButton type="submit" :loading="isLoading">
      Submit
    </UButton>
  </UForm>
</template>
