<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { format } from 'date-fns'
import { Calendar, MapPin, Truck, User } from 'lucide-vue-next'
import { UButton, USelectMenu } from '#components'

const route = useRoute()
const order_id = route.params.id as string

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Awaiting Payment', value: 'awaiting_payment', disabled: true },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Canceled', value: 'canceled' },
  { label: 'Returned', value: 'returned' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Failed', value: 'failed', disabled: true },
]

const isStatusUpdate = ref(false)

// @ts-ignore
const { data }: any = await useFetch(`/api/dashboard/orders/${order_id}`)

const response = data.value?.data?.order as any
const selectedStatus: any = ref(response.order.status)

const handleStatus = async () => {
  isStatusUpdate.value = true
  const store = useSettingsStore()
  const { error } = await useFetch(`/api/dashboard/orders/${order_id}`, {
    body: { status: selectedStatus.value },
    // @ts-ignore
    method: 'patch',
  })
  if (error.value) {
    store.setIsError(true, 'Failed to update status.')
  }
  isStatusUpdate.value = false
}
</script>

<template>
  <div>
    <h3 class="font-medium obotoronika-title text-4xl font-Homenaje">
      Order Details
    </h3>
    <div
      class="flex justify-between items-center border-b border-t obotoronika-border-color py-2 mt-2"
    >
      <div>
        <h3
          class="font-medium obotoronika-title flex gap-2 items-center text-lg"
        >
          <Calendar :size="22" />
          {{
            format(new Date(response.order.created_at), "EEE, MMMM dd, yyyy, h:mmaaa")
          }}
        </h3>
        <p class="text-sm mt-1">
          Order ID: #{{ response.order.order_id.replace("ORD-", "") }}
        </p>
      </div>
      <div class="flex gap-2">
        <USelectMenu
          v-model="selectedStatus"
          :options="statusOptions"
          value-attribute="value"
          option-attribute="label"
          placeholder="Select Status"
          class="w-32 md:w-28 lg:w-40"
          size="md"
        />
        <UButton
          icon="mdi:content-save-outline"
          color="green"
          variant="solid"
          label="Save"
          :trailing="false"
          :loading="isStatusUpdate"
          @click="handleStatus"
        />
        <UButton
          icon="i-heroicons-printer"
          color="black"
          variant="solid"
          label="Print"
          :trailing="false"
        />
      </div>
    </div>
    <div class="grid grid-cols-12 gap-4 mt-4">
      <div class="col-span-4 border p-4 rounded-md flex gap-2">
        <div
          class="w-12 h-12 rounded-full border flex items-center justify-center bg-gray-50 dark:bg-dark text-primary"
        >
          <User />
        </div>
        <div>
          <h4 class="font-semibold obotoronika-title mt-2">
            Customer
          </h4>
          <div class="mt-0.5">
            <ul>
              <li>
                <b class="font-normal text-sm">Name: <span>{{ response?.order?.user?.name }}</span></b>
              </li>
              <li>
                <b class="font-normal text-sm">Email: <span>{{ response?.order?.user?.email }}</span></b>
              </li>
              <li>
                <b class="font-normal text-sm">Phone: <span>{{ response?.order?.user?.phone }}</span></b>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-span-4 border p-4 rounded-md flex gap-2">
        <div
          class="w-12 h-12 rounded-full border flex items-center justify-center bg-gray-50 dark:bg-dark text-green-500"
        >
          <Truck />
        </div>
        <div>
          <h4 class="font-semibold obotoronika-title mt-2">
            Order Info
          </h4>
          <div class="mt-0.5">
            <ul>
              <li>
                <b class="font-normal text-sm">Shipping: Frago Express</b>
              </li>
              <li>
                <b class="font-normal text-sm">Pay method: Card</b>
              </li>
              <li>
                <b class="font-normal text-sm">Status:</b>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-span-4 border p-4 rounded-md flex gap-2">
        <div
          class="w-12 h-12 rounded-full border flex items-center justify-center bg-gray-50 dark:bg-dark text-blue-500"
        >
          <MapPin />
        </div>
        <div>
          <h4 class="font-semibold obotoronika-title mt-2">
            Deliver to
          </h4>
          <div class="mt-0.5">
            <ul>
              <li>
                <b class="font-normal text-sm">Address: {{ response.order.shipping_address }}</b>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-4 grid grid-cols-12 gap-4">
      <div class="border p-4 rounded-md col-span-4">
        <h4 class="font-semibold obotoronika-title mt-2">
          Payment info
        </h4>
        <p>Master Card**** ****1234</p>
        <ul>
          <li>
            <b class="font-medium text-sm">Business name:</b>
          </li>
          <li>
            <b class="font-medium text-sm">Phone:</b>
          </li>
        </ul>
      </div>
      <div class="border p-4 rounded-md col-span-8 flex flex-col gap-2">
        <h4 class="font-semibold obotoronika-title mt-2">
          Notes
        </h4>
        <textarea
          class="border obotoronika-border-color rounded-md p-2 outline-none"
        />
        <UButton
          icon="i-heroicons-pencil-square"
          color="blue"
          variant="solid"
          label="Save note"
          :trailing="false"
          class="w-fit ml-auto"
        />
      </div>
    </div>
    <DashboardOrdersDetailsTable :items="response.order.items ?? []" />
  </div>
</template>
