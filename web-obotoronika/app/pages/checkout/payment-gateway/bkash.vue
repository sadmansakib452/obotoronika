<script lang='ts' setup>
import { z } from 'zod'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UInput } from '#components'

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)

const state = reactive({
  phone: '',
  pin: '',
})

const schema = z.object({
  phone: z
    .string({ required_error: 'Phone is mandatory.' })
    .nonempty('Phone is mandatory.'),
  pin: z
    .string({ required_error: 'Pin is mandatory.' })
    .nonempty('Pin is mandatory.'),
})
type Schema = z.output<typeof schema>

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const order_id = route.query.orderID
  isLoading.value = true
  const { data } = event
  const info = {
    number: data.phone,
    success: true,
    amount: 26450,
  }
  const payload = {
    order_id: order_id,
    payment_method: 'bkash',
    payment_info: JSON.stringify(info),
  }
  await useFetch('/api/orders/checkout', { method: 'PATCH', body: payload })
  isLoading.value = false
  router.push(`/order-received?orderID=${order_id}`)
}
</script>

<template>
  <div class="flex justify-center items-center">
    <div class="w-11/12 mx-auto my-6 shadow-md p-4 rounded-md lg:w-96">
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup label="Bkash Number" name="phone" class="mb-4">
          <UInput v-model="state.phone" size="lg" placeholder="Bkash Number" />
        </UFormGroup>
        <UFormGroup label="Pin" name="pin" class="mb-4">
          <UInput v-model="state.pin" size="lg" placeholder="Pin" />
        </UFormGroup>
        <UButton
          label="Confirm"
          size="lg"
          block
          :loading="isLoading"
          type="submit"
        />
      </UForm>
    </div>
  </div>
</template>
