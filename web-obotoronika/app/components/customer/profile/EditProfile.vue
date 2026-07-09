<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { useAuthStore } from '@/stores/auth'
import { UButton, UForm, UFormGroup, UInput, UPopover, USelect } from '#components'

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const toast = useToast()

const dob = ref<Date | undefined>()

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

function loadProfileFromUser() {
  const u = user.value
  if (!u) return
  const meta = u.user_metadata as Record<string, unknown> | undefined
  profileState.name = (meta?.name as string) ?? u.email?.split('@')[0] ?? ''
  profileState.email = u.email ?? ''
  profileState.phone = (u.phone as string) ?? (meta?.phone as string) ?? ''
  profileState.gender = (meta?.gender as string) ?? undefined
  const dobStr = meta?.dob as string | undefined
  dob.value = dobStr ? (parseISO(dobStr) as Date) : undefined
}

onMounted(loadProfileFromUser)
watch(user, loadProfileFromUser, { immediate: true })

const isSubmitting = ref(false)
async function handleUpdateProfile(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true
  try {
    await $fetch('/api/profile', {
      method: 'PATCH',
      body: {
        name: event.data.name,
        email: event.data.email,
        phone: event.data.phone,
        gender: profileState.gender ?? null,
        dob: dob.value ? format(dob.value, 'yyyy-MM-dd') : null,
      },
    })
    await auth.fetchUser()
    toast.add({ title: 'Profile updated successfully', color: 'green' })
  }
  catch (err: any) {
    toast.add({
      title: 'Failed to update profile',
      description: err?.data?.message ?? err?.message ?? 'Please try again.',
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
    :schema="profileSchema"
    :state="profileState"
    class="space-y-4 mt-4"
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
    <div class="form-group !mb-8">
      <UFormGroup label="Email" name="email" size="lg">
        <UInput v-model="profileState.email" placeholder="Email" />
      </UFormGroup>
      <UFormGroup label="Phone" name="phone" size="lg">
        <UInput v-model="profileState.phone" placeholder="Phone" />
      </UFormGroup>
    </div>
    <UButton
      type="submit"
      size="lg"
      color="green"
      block
      class="w-fit ml-auto"
      :loading="isSubmitting"
      :disabled="isSubmitting"
    >
      Save Changes
    </UButton>
  </UForm>
</template>
