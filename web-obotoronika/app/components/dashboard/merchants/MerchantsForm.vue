<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { z } from 'zod'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UInput, UInputMenu, USelectMenu, UTextarea } from '#components'

interface IProps {
  merchantId?: number | null
}
const props = withDefaults(defineProps<IProps>(), {
  merchantId: null,
})
const emit = defineEmits(['close-modal', 'refetch-data'])
const toast = useToast()
const selectedStatus: any = ref('')
const state = reactive({
  name: '',
  address: '',
  website: 'https://',
  description: '',
  image: undefined,
  user_id: undefined,
})
const pathname = ref('')
const pending = ref(false)
const isLoading = ref(false)

const id: any = computed(() => !!props.merchantId)

const statusOptions = [
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'Inactive',
    value: 'inactive',
  },
  {
    label: 'Suspended',
    value: 'suspended',
  },
  {
    label: 'Pending',
    value: 'pending',
  },
  {
    label: 'banned',
    value: 'banned',
  },
]

const schema = z
  .object({
    user_id: z
      .string({ required_error: 'User is required.' }),
    name: z
      .string()
      .nonempty('Business Name is required.')
      .min(2, 'Name must be at least 2 characters'),
    address: z
      .string()
      .nonempty('Address is required.')
      .min(5, 'Address must be at least 2 characters'),
    website: z
      .string()
      .optional()
      .refine(
        value =>
          !value || value === 'https://' || value === 'http://' || /^https?:\/\/[^\s$.?#].[^\s]*$/.test(value),
        'Website must be a valid URL',
      ),
  })
type Schema = z.output<typeof schema>

let fetchedData: SuccessResponse | undefined = undefined

if (props.merchantId) {
  // @ts-ignore
  const { data } = await useFetch(`/api/merchants/${props.merchantId}`)
  fetchedData = data.value as unknown as SuccessResponse
  if (fetchedData.data?.id) {
    state.user_id = fetchedData.data?.user_id
    state.name = fetchedData.data?.name
    state.description = fetchedData.data?.description ?? ''
    state.address = fetchedData.data?.address
    state.website = fetchedData.data?.website ?? ''
    pathname.value = fetchedData.data?.logo
    selectedStatus.value = fetchedData.data?.status
  }
}

async function search(q: string) {
  if (props.merchantId) {
    const { data }: any = await useFetch(`/api/dashboard/users/${state.user_id}`)
    return [data.value?.data]
  }
  else {
    const query = {
      q,
      isMerchants: true,
    }

    const { data: users, pending: Pending } = await useFetch('/api/dashboard/users', {
      query,
      default: () => ({
        status: 200,
        message: 'OK',
        data: [],
        paginate: { nextPage: null, page: 1, perPage: 10, total: 0 },
      }),
    })
    pending.value = Pending.value
    const fetchedData = users.value as unknown as SuccessResponse
    console.log(fetchedData.data?.users)
    return fetchedData.data?.users
  }
}

const handleFileInputChange = (e: any) => {
  const file = e[0]
  if (file) {
    const fileReader = new FileReader()
    fileReader.onload = function () {
      state.image = fileReader.result as any
    }
    fileReader.readAsDataURL(file)
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isLoading.value = true
    const formData = new FormData()
    formData.append('user_id', state.user_id as unknown as string)
    formData.append('name', event.data.name)
    formData.append('address', state.address as unknown as string)
    if (state.website && state.website !== 'https://' && state.website !== 'http://') {
      formData.append('website', state.website as string)
    }
    formData.append('description', state.description as unknown as string)
    if (selectedStatus.value) {
      formData.append('status', selectedStatus.value as unknown as string)
    }
    if (state.image) {
      formData.append('image', state.image as unknown as string)
    }

    if (props.merchantId) {
      if (state.image) {
        formData.append('pathname', pathname.value)
      }
      await $fetch(`/api/dashboard/merchants/${props.merchantId}`, {
        method: 'PATCH',
        body: formData,
      })
    }
    else {
      await $fetch('/api/dashboard/merchants', {
        method: 'POST',
        body: formData,
      })
    }
    emit('close-modal')
    emit('refetch-data')
    toast.add({ title: 'Merchant has been created.' })
  }
  catch (error: any) {
    toast.add({ color: 'red', title: 'Failed to create Merchant', description: error?.message })
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormGroup label="Select User" name="user_id">
        <UInputMenu
          v-model="state.user_id"
          :search="search"
          :loading="pending"
          placeholder="Search for a user..."
          option-attribute="email"
          trailing
          value-attribute="id"
          :disabled="props.merchantId ? true : false"
        />
      </UFormGroup>
      <UFormGroup label="Logo" name="logo">
        <UInput
          type="file"
          size="lg"
          icon="i-heroicons-photo"
          @change="handleFileInputChange"
        />
      </UFormGroup>
      <UFormGroup label="Business Name" name="name">
        <UInput v-model="state.name" size="lg" />
      </UFormGroup>
      <UFormGroup label="Address" name="address">
        <UInput v-model="state.address" size="lg" />
      </UFormGroup>
      <UFormGroup v-if="id" label="Status" name="status">
        <USelectMenu
          v-model="selectedStatus"
          :options="statusOptions"
          value-attribute="value"
          option-attribute="label"
          placeholder="Filter by status"
          size="lg"
        />
      </UFormGroup>
      <UFormGroup label="Website" name="website">
        <UInput v-model="state.website" size="lg" />
      </UFormGroup>
      <UFormGroup label="Description" name="description">
        <UTextarea v-model="state.description" autoresize placeholder="Description..." />
      </UFormGroup>
      <UButton
        type="submit"
        size="lg"
        block
        :loading="isLoading"
      >
        {{ props.merchantId ? 'Update' : 'Create' }}
      </UButton>
    </UForm>
  </div>
</template>
