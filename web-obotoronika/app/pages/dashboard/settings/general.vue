<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { z } from 'zod'
import { format } from 'date-fns'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { useAuthStore } from '@/stores/auth'
import { UButton, UForm, UFormGroup, UInput, UPopover, USelect } from '#components'

const auth = useAuthStore()
const { user } = storeToRefs(auth)

const dob = ref()

const profileSchema = z.object({
  name: z.string({ required_error: 'Name is required.' }),
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please provide a valid email address.'),
  phone: z
    .string({ required_error: 'Phone number is required.' })
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Please provide a valid phone number.'),
})

type Schema = z.output<typeof profileSchema>
const profileState = reactive({
  name: undefined as string | undefined,
  email: undefined as string | undefined,
  phone: undefined as string | undefined,
  gender: undefined as string | undefined,
})

onMounted(() => {
  if (user.value) {
    profileState.name = user.value?.user_metadata.name
    profileState.email = user.value.email
  }
})

async function handleUpdateProfile(event: FormSubmitEvent<Schema>) {
  // Do something with data
  console.log(event.data)
}
setPageLayout('dashboard-settings-navigator')
definePageMeta({
  roles: ['super_admin', 'admin', 'manager', 'seller'],
})
</script>

<template>
  <div class="w-full">
    <CustomCard>
      <div class="mb-4">
        <h3 class="font-Homenaje text-3xl obotoronika-title">
          Personal Information
        </h3>
        <p class="obotoronika-muted-text text-sm">
          Manage your personal details and contact information.
        </p>
      </div>
      <UForm
        :schema="profileSchema"
        :state="profileState"
        class="space-y-4"
        @submit="handleUpdateProfile"
      >
        <div class="flex gap-4 w-full mb-8 flex-col lg:flex-row">
          <UFormGroup
            label="Name"
            name="name"
            size="lg"
            class="w-full"
          >
            <UInput v-model="profileState.name" placeholder="Full Name" />
          </UFormGroup>
          <UFormGroup
            label="Gender"
            name="gender"
            size="lg"
            class="w-full"
          >
            <USelect
              v-model="profileState.gender"
              :options="['Male', 'Female', 'Other']"
              placeholder="Gender"
            />
          </UFormGroup>
        </div>
        <div class="form-group !mb-8">
          <UFormGroup label="Email" name="email" size="lg">
            <UInput v-model="profileState.email" placeholder="Email" />
          </UFormGroup>
          <UFormGroup label="Phone" name="phone" size="lg">
            <UInput v-model="profileState.phone" placeholder="Phone" />
          </UFormGroup>
        </div>
        <div class="form-group">
          <UFormGroup label="Birthday" name="dob" size="lg">
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton
                icon="i-heroicons-calendar-days-20-solid"
                :label="dob ? format(dob, 'd MMM, yyy') : 'Birthday'"
                block
                variant="outline"
              />
              <template #panel="{ close }">
                <DatePicker v-model="dob" is-required @close="close" />
              </template>
            </UPopover>
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
  </div>
</template>
