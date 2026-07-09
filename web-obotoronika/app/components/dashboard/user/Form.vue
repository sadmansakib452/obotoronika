<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { z } from 'zod'

// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UInput, USelectMenu } from '#components'

interface IProps {
  userId?: number | null
}
const props = withDefaults(defineProps<IProps>(), {
  userId: null,
})
const emit = defineEmits(['close'])

const toast = useToast()

const roles = [
  {
    label: 'Super Admin',
    value: 'super_admin',
  },
  {
    label: 'Admin',
    value: 'admin',
  },
  {
    label: 'Manager',
    value: 'manager',
  },
  {
    label: 'Customer',
    value: 'customer',
  },
  {
    label: 'Seller',
    value: 'seller',
  },
]
const state = reactive({
  name: '',
  email: '',
  phone: '',
  password: '12345678',
  role: 'seller',
})
const passwordVisibility = ref(false)

const isEdit = computed(() => !!props.userId)

const schema = z
  .object({
    name: z
      .string()
      .nonempty('Name is required')
      .min(2, 'Name must be at least 3 characters'),
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z
      .string()
      .nonempty('Password is required')
      .min(8, 'Password must be at least 8 characters'),
    role: z.enum(['super_admin', 'admin', 'customer', 'seller', 'manager'], {
      message: 'Role must be one of the following: customer, seller.',
    })
      .default('customer'),
  })
  .refine(
    data => data.email || data.phone,
    {
      message: 'Either email or phone must be provided',
      path: ['email'],
    },
  )
  .superRefine(({ email }, ctx: any) => {
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      ctx.addIssue({
        path: ['email'],
        message: 'Invalid email',
      })
    }
    if (state.phone && (state.phone.length < 10 || state.phone.length > 15)) {
      ctx.addIssue({
        path: ['phone'],
        message: 'Phone must be between 10 and 15 digits',
      })
    }
  })
type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { phone, email, ...rest } = event.data

  // Build request payload, only include phone/email if provided
  const payload = {
    ...rest,
    ...(phone ? { phone } : {}),
    ...(email ? { email } : {}),
  }

  const method = isEdit.value ? 'patch' : 'post'
  const url = isEdit.value
    ? `/api/dashboard/users/${props.userId}` // dynamically set the user ID
    : `/api/dashboard/users`

  try {
    const { error } = await useFetch(url, {
      method,
      body: payload,
    })

    if (error.value) {
      throw new Error(error.value.data?.message || 'Something went wrong')
    }

    toast.add({
      title: isEdit.value ? 'User updated successfully.' : 'User created successfully.',
    })
    emit('close')
  }
  catch (error: any) {
    toast.add({
      color: 'red',
      title: isEdit.value ? 'Failed to update user' : 'Failed to create user',
      description: error.message || 'Unexpected error',
    })
  }
}

onMounted(async () => {
  if (props.userId) {
    const { data: res }: any = await useFetch(`/api/dashboard/users/${props.userId}`)
    const data = res.value.data
    state.email = data?.email ?? ''
    state.phone = data?.phone ?? ''
    state.name = data?.user_metadata?.name ?? data?.name
    state.role = data?.user_metadata?.role ?? data?.role
    console.log(data)
  }
})
</script>

<template>
  <div>
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormGroup label="Name" name="name">
        <UInput v-model="state.name" size="lg" />
      </UFormGroup>
      <UFormGroup label="Email" name="email">
        <UInput v-model="state.email" size="lg" />
      </UFormGroup>
      <UFormGroup label="Phone" name="phone">
        <UInput v-model="state.phone" size="lg" />
      </UFormGroup>
      <UFormGroup label="Role" name="role">
        <USelectMenu
          v-model="state.role"
          :options="roles"
          value-attribute="value"
          option-attribute="label"
          placeholder="Filter by status"
          class="w-full"
          size="lg"
        />
      </UFormGroup>
      <UFormGroup label="Password" name="password">
        <UInput
          v-model="state.password"
          :type="passwordVisibility ? 'text' : 'password'"
          :ui="{ icon: { trailing: { pointer: '' } } }"
          size="lg"
        >
          <template #trailing>
            <UButton
              v-show="true"
              color="gray"
              variant="link"
              :icon="`i-heroicons-eye${passwordVisibility ? '-slash' : ''}`"
              @click="passwordVisibility = !passwordVisibility"
            />
          </template>
        </UInput>
      </UFormGroup>
      <UButton type="submit" size="lg" block>
        Submit
      </UButton>
    </UForm>
  </div>
</template>
