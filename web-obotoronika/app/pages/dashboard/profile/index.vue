<script lang="ts" setup>
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UDivider, UForm, UFormGroup, UInput } from '#components'

const authUser = useAuthStore()
const { user } = storeToRefs(authUser)

const schema = z.object({
  name: z.string({ required_error: 'Name is required.' }),
  email: z.string({ required_error: 'Email is required.' }).email('Please provide a valid email address.'),
  phone: z
    .string({ required_error: 'Phone number is required.' })
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Please provide a valid phone number.'),
})

type Schema = z.output<typeof schema>
const state = reactive({
  name: undefined,
  email: undefined,
  phone: undefined,
  password: undefined,
  newPassword: undefined,
  confirmPassword: undefined,
})

if (user.value?.id) {
  const { user_metadata } = user.value
  state.name = user_metadata?.name
  state.email = user_metadata?.email
  state.phone = user_metadata?.phone
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with data
  console.log(event.data)
}
</script>

<template>
  <div>
    <div class="profile-banner">
      <div class="container relative h-full">
        <div class="absolute -bottom-[6rem] flex items-center">
          <UiAvatar class="!w-[192px] !h-[192px] shadow-lg">
            <UiAvatarImage :src="user?.user_metadata?.avatar_url?.replace('=s96-c', '=s192-c')" />
            <UiAvatarFallback class="!text-4xl">
              {{ user?.user_metadata.name.split(' ')[0].charAt(0) }}{{ user?.user_metadata?.name?.split(' ')?.[1]?.charAt(0) }}
            </UiAvatarFallback>
          </UiAvatar>
          <div class="user-meta">
            <b>{{ user?.user_metadata.full_name }}</b>
            <span>{{ user?.email }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-32">
      <div class="profile w-2/3 mx-auto border p-4 rounded-md">
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
          <h3 class="obotoronika-text-color font-semibold text-xl">
            My Profile
          </h3>
          <UFormGroup label="Full Name" name="name" size="lg">
            <UInput v-model="state.name" />
          </UFormGroup>
          <div class="form-group !mb-8">
            <UFormGroup label="Email" name="email" size="lg">
              <UInput v-model="state.email" />
            </UFormGroup>
            <UFormGroup label="Phone" name="phone" size="lg">
              <UInput v-model="state.phone" />
            </UFormGroup>
          </div>
          <UDivider />
          <h3 class="obotoronika-text-color font-semibold text-xl">
            Password
          </h3>
          <UFormGroup label="Password" name="password" size="lg">
            <UInput v-model="state.password" />
          </UFormGroup>
          <div class="form-group">
            <UFormGroup label="New Password" name="newPassword" size="lg">
              <UInput v-model="state.newPassword" />
            </UFormGroup>
            <UFormGroup label="Confirm Password" name="confirmPassword" size="lg">
              <UInput v-model="state.confirmPassword" />
            </UFormGroup>
          </div>
          <UButton type="submit" block size="lg">
            Save
          </UButton>
        </UForm>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-banner {
    @apply h-[232px] rounded-lg;
    background: #FDC830;
    background: -webkit-linear-gradient(to right, #F37335, #FDC830);
    background: linear-gradient(to right, #F37335, #FDC830);

    img {
        @apply w-[192px] h-[192px] rounded-full object-cover border-[6px] border-white shadow-lg;
    }

    .user-meta {
        @apply mt-24 flex flex-col ml-8 obotoronika-text-color;

        b {
            @apply text-xl;
        }
    }
}
</style>
