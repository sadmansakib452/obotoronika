<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { House, MapPin, Phone, Star } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { UButton, UModal } from '#components'

definePageMeta({
  roles: ['customer', 'super_admin'],
})

const isOpen = ref(false)
const selectedAddress = ref<Record<string, any> | undefined>(undefined)

const isDeletingAddress = ref<number | null>(null)
const isSettingDefaultAddress = ref<number | null>(null)
const isSettingBillingAddress = ref<number | null>(null)

const store = useUserStore()

// Fetch addresses initially
// @ts-ignore
await store.getAddresses()

// Handlers
const handleEdit = (newAddress: any) => {
  isOpen.value = true
  selectedAddress.value = newAddress
}

const handleNewAddress = () => {
  isOpen.value = true
  selectedAddress.value = undefined
}

const handleDefault = async (id: number, type: string) => {
  const query: any = {}

  if (type === 'shipping') {
    isSettingDefaultAddress.value = id
    query.is_default = true
  }
  else {
    isSettingBillingAddress.value = id
    query.is_billing = true
  }

  try {
    await useFetch(`/api/profiles/addresses/${id}/default`, {
      method: 'PATCH',
      query: query,
    })
    // You may want to re-fetch addresses here if needed
    // await store.getAddresses();
  }
  finally {
    await store.getAddresses()
    isSettingDefaultAddress.value = null
    isSettingBillingAddress.value = null
  }
}

const handleDelete = async (id: number) => {
  isDeletingAddress.value = id
  try {
    await useFetch(`/api/profiles/addresses/${id}`, {
      method: 'DELETE',
    })
    // Optional: await store.getAddresses();
  }
  finally {
    await store.getAddresses()
    isDeletingAddress.value = null
  }
}

useHead({
  title: 'My Addresses | Obotoronika',
})
</script>

<template>
  <div class="my-8 w-11/12 mx-auto lg:w-10/12 lg:ml-4">
    <div class="flex flex-col mx-auto justify-between md:flex-row">
      <div>
        <h3 class="font-Homenaje text-3xl obotoronika-title">
          My Addresses
        </h3>
        <p class="obotoronika-muted-text text-sm">
          Add, edit, or remove shipping locations to make checkout faster and
          easier.
        </p>
      </div>

      <UButton
        label="Add new address"
        size="lg"
        icon="i-heroicons-plus"
        block
        class="w-52 h-fit mt-4 md:mt-0"
        color="black"
        @click="handleNewAddress"
      />
    </div>

    <div class="grid mx-auto grid-cols-1 gap-8 mt-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="address in store.addresses"
        :key="address.id"
        class="border p-4 rounded-md obotoronika-border-color"
      >
        <!-- Header -->
        <div class="mb-4 flex justify-between items-center">
          <b
            class="obotoronika-muted-text font-medium text-xs flex items-center gap-1 capitalize"
          >
            <MapPin :size="16" />
            {{ address.address_type }}
            <p
              v-if="address.is_default"
              class="font-medium flex items-center gap-1 bg-primary/20 text-primary w-fit rounded-full px-2 text-[10px] py-1"
            >
              <Star :size="14" />
              Default
            </p>
          </b>
          <div class="flex gap-1 w-fit ml-auto">
            <UButton
              label="Delete"
              size="2xs"
              icon="i-heroicons-trash"
              color="red"
              class="w-fit"
              :loading="isDeletingAddress === address.id"
              @click="handleDelete(address.id)"
            />
            <UButton
              label="Edit"
              size="2xs"
              icon="i-heroicons-pencil-square"
              color="white"
              class="w-fit"
              @click="() => handleEdit(address)"
            />
          </div>
        </div>

        <!-- Info -->
        <div class="border-b obotoronika-border-color pb-4">
          <p class="font-medium obotoronika-title">
            {{ address.fullname }}
          </p>
          <p
            class="obotoronika-muted-text text-sm flex items-center gap-1 my-1.5"
          >
            <Phone :size="16" />
            {{ address.phone }}
          </p>
          <p class="obotoronika-muted-text text-sm flex items-center gap-1">
            <House :size="16" />
            {{ address.address }},
            <span class="capitalize">{{ address.city }}, {{ address.region }}</span>
          </p>
        </div>

        <!-- Actions -->
        <!-- <div class="pt-3 flex gap-1 w-fit ml-auto">

        </div> -->
        <div class="flex gap-1 w-fit ml-auto mt-3">
          <UButton
            label="Set default shipping"
            size="2xs"
            icon="i-heroicons-star"
            color="white"
            class="w-fit"
            :loading="isSettingDefaultAddress === address.id"
            @click="handleDefault(address.id, 'shipping')"
          />
          <UButton
            label="Set default billing"
            size="2xs"
            icon="i-heroicons-star"
            color="white"
            class="w-fit"
            :loading="isSettingBillingAddress === address.id"
            @click="handleDefault(address.id, 'billing')"
          />
        </div>
      </div>
    </div>

    <!-- Modal -->
    <UModal
      v-model="isOpen"
      :ui="{ width: 'w-full sm:max-w-3xl', container: 'items-center' }"
    >
      <CustomerAddressForm :row="selectedAddress" @close="isOpen = false" />
    </UModal>
  </div>
</template>
