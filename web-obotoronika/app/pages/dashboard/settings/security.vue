<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { z } from 'zod'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UInput } from '#components'

const profileSchema = z.object({
  name: z.string({ required_error: 'Name is required.' }),
  email: z.string({ required_error: 'Email is required.' }).email('Please provide a valid email address.'),
  phone: z
    .string({ required_error: 'Phone number is required.' })
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Please provide a valid phone number.'),
})

type Schema = z.output<typeof profileSchema>
const profileState = reactive({
  name: undefined,
  email: undefined,
  phone: undefined,
  gender: '',
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
  <div>
    <CustomCard>
      <div class="mb-4">
        <h3 class="font-Homenaje text-3xl obotoronika-title">
          Change Password
        </h3>
        <p class="obotoronika-muted-text text-sm">
          Update your current password to keep your account secure.
        </p>
      </div>
      <UForm
        :schema="profileSchema"
        :state="profileState"
        class="space-y-4 mt-4"
        @submit="handleUpdateProfile"
      >
        <UFormGroup
          label="Old Password"
          name="name"
          size="lg"
          class="w-full"
        >
          <UInput v-model="profileState.name" placeholder="********" />
        </UFormGroup>
        <div class="form-group !mb-8">
          <UFormGroup label="New Password" name="email" size="lg">
            <UInput v-model="profileState.email" placeholder="********" />
          </UFormGroup>
          <UFormGroup label="Confirm Password" name="phone" size="lg">
            <UInput v-model="profileState.phone" placeholder="********" />
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
    <CustomCard class="mt-6">
      <DashboardSettingsLoggedDevices />
    </CustomCard>
  </div>
</template>
