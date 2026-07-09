<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { z } from 'zod'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { useAuthStore } from '@/stores/auth'
import { UButton, UForm, UFormGroup, UInput } from '#components'

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const toast = useToast()
const supabase = useSupabaseClient()

const passwordSchema = z
  .object({
    currentPassword: z.string({ required_error: 'Current password is required.' }),
    newPassword: z
      .string({ required_error: 'New password is required.' })
      .min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string({ required_error: 'Please confirm your new password.' }),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type Schema = z.output<typeof passwordSchema>
const passwordState = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const isSubmitting = ref(false)
async function handleChangePassword(event: FormSubmitEvent<Schema>) {
  if (!user.value?.email) {
    toast.add({
      title: 'Cannot change password',
      description: 'Password change requires an email sign-in account.',
      color: 'red',
    })
    return
  }

  isSubmitting.value = true
  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: event.data.currentPassword,
    })
    if (signInError) {
      toast.add({
        title: 'Current password is incorrect',
        color: 'red',
      })
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: event.data.newPassword,
    })
    if (updateError) {
      toast.add({
        title: 'Failed to update password',
        description: updateError.message,
        color: 'red',
      })
      return
    }

    toast.add({ title: 'Password updated successfully', color: 'green' })
    passwordState.currentPassword = ''
    passwordState.newPassword = ''
    passwordState.confirmPassword = ''
  }
  catch (err: any) {
    toast.add({
      title: 'Failed to update password',
      description: err?.message ?? 'Please try again.',
      color: 'red',
    })
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UForm
    :schema="passwordSchema"
    :state="passwordState"
    class="space-y-4 mt-4"
    @submit="handleChangePassword"
  >
    <UFormGroup
      label="Current Password"
      name="currentPassword"
      size="lg"
      class="w-full"
    >
      <UInput
        v-model="passwordState.currentPassword"
        :type="showCurrentPassword ? 'text' : 'password'"
        placeholder="********"
        autocomplete="current-password"
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template #trailing>
          <UButton
            color="gray"
            variant="link"
            :icon="showCurrentPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
            @click="showCurrentPassword = !showCurrentPassword"
          />
        </template>
      </UInput>
    </UFormGroup>
    <div class="form-group !mb-8">
      <UFormGroup label="New Password" name="newPassword" size="lg">
        <UInput
          v-model="passwordState.newPassword"
          :type="showNewPassword ? 'text' : 'password'"
          placeholder="********"
          autocomplete="new-password"
          :ui="{ icon: { trailing: { pointer: '' } } }"
        >
          <template #trailing>
            <UButton
              color="gray"
              variant="link"
              :icon="showNewPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              @click="showNewPassword = !showNewPassword"
            />
          </template>
        </UInput>
      </UFormGroup>
      <UFormGroup label="Confirm New Password" name="confirmPassword" size="lg">
        <UInput
          v-model="passwordState.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="********"
          autocomplete="new-password"
          :ui="{ icon: { trailing: { pointer: '' } } }"
        >
          <template #trailing>
            <UButton
              color="gray"
              variant="link"
              :icon="showConfirmPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </UInput>
      </UFormGroup>
    </div>
    <UButton
      type="submit"
      size="lg"
      block
      color="red"
      class="w-fit ml-auto"
      :loading="isSubmitting"
      :disabled="isSubmitting"
    >
      Change Password
    </UButton>
  </UForm>
</template>
