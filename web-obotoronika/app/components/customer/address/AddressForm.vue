<script lang="ts" setup>
// @ts-ignore
import { z } from 'zod'
import { regionsList, cityList } from './helper'
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UInput, URadioGroup, USelectMenu } from '#components'

const userStore = useUserStore()

const emit = defineEmits(['close'])
const props = defineProps({
  row: {
    type: Object,
    default: null, // Default to null if no row is passed
  },
})

// Initialize state based on the `row` prop
const state = ref({
  fullname: props.row?.fullname || '',
  phone: props.row?.phone || '',
  region: props.row?.region || undefined,
  city: props.row?.city || undefined,
  address: props.row?.address || '',
  address_type: props.row?.address_type || 'home',
})
const isSubmit = ref(false)

// Region and city data
const regions = ref(regionsList)

const cities = ref(cityList)

// Filtered cities based on selected region
const filteredCities = computed(() =>
  cities.value.filter((city: any) => city.regionId === state.value.region),
)

const schema = z.object({
  fullname: z
    .string({ required_error: 'Name is mandatory.' })
    .nonempty('Name is mandatory.'),
  phone: z
    .string({ required_error: 'Phone is mandatory.' })
    .nonempty('Phone is mandatory.'),
  region: z.string({ required_error: 'Region is mandatory.' }),
  city: z.string({ required_error: 'City is mandatory.' }),
  address: z
    .string({ required_error: 'Address is mandatory.' })
    .nonempty('Address is mandatory.'),
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmit.value = true

    // Determine the request method and URL based on `props.row`
    const method = props.row ? 'PATCH' : 'POST'
    const url = props.row
      ? `/api/profiles/addresses/${props.row.id}` // PATCH URL
      : '/api/profiles/addresses' // POST URL

    await useFetch(url, {
      method,
      body: state.value,
    })

    emit('close')
    userStore.getAddresses()
  }
  catch (error) {
    console.error('Error submitting address:', error)
  }
  finally {
    isSubmit.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <UForm :schema="schema" :state="state" @submit="onSubmit">
      <h1 class="obotoronika-text-color font-semibold text-xl mb-4">
        {{ props.row ? "Edit Address" : "Add New Address" }}
      </h1>
      <div class="form-group">
        <UFormGroup label="Full Name" name="fullname" class="mb-4">
          <UInput
            v-model="state.fullname"
            size="lg"
            placeholder="Enter full name."
          />
        </UFormGroup>
        <UFormGroup label="Phone" name="phone" class="mb-4">
          <UInput
            v-model="state.phone"
            size="lg"
            placeholder="Enter phone number."
          />
        </UFormGroup>
      </div>
      <div class="form-group">
        <UFormGroup label="Province / Region" name="region" class="mb-4">
          <USelectMenu
            v-model.number="state.region"
            :options="regions"
            value-attribute="id"
            option-attribute="name"
            placeholder="Select region..."
            class="w-full"
            size="lg"
          />
        </UFormGroup>
        <UFormGroup label="City" name="city" class="mb-4">
          <USelectMenu
            v-model.number="state.city"
            :options="filteredCities"
            value-attribute="id"
            option-attribute="name"
            placeholder="Select city..."
            class="w-full"
            size="lg"
          />
        </UFormGroup>
      </div>
      <div class="form-group">
        <UFormGroup label="Address" name="address" class="mb-4">
          <UInput
            v-model="state.address"
            size="lg"
            placeholder="Enter address."
          />
        </UFormGroup>
        <URadioGroup
          v-model="state.address_type"
          :options="[
            {
              value: 'home',
              label: 'Home',
            },
            {
              value: 'office',
              label: 'Office',
            },
          ]"
          legend="Address Type"
          orientation="horizontal"
          :ui="{ fieldset: 'flex items-center space-x-4' }"
          :ui-radio="{
            wrapper: 'cursor-pointer',
            label: 'text-sm font-medium',
          }"
        />
      </div>
      <div class="flex gap-4 justify-end">
        <UButton
          label="Cancel"
          size="lg"
          block
          class="w-28 h-fit border obotoronika-border-color"
          variant="ghost"
          color="gray"
          type="button"
          @click="emit('close')"
        />
        <UButton
          :label="props.row ? 'Update' : 'Save'"
          size="lg"
          block
          class="w-28 h-fit"
          color="green"
          type="submit"
          :loading="isSubmit"
        />
      </div>
    </UForm>
  </div>
</template>
