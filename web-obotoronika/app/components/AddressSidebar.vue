<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { UButton } from '#components'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const userStore = useUserStore()
const toast = useToast()
// @ts-ignore
await userStore.getAddresses()

const activeAddressId = ref(
  userStore.addresses.find(address => address.is_saved || address.is_default)
    ?.id || null,
)
const isSubmit = ref(false)

const hasAddresses = computed(() => (userStore.addresses?.length ?? 0) > 0)

watch(
  () => userStore.addresses,
  (addresses) => {
    if (!addresses?.length) {
      activeAddressId.value = null
      return
    }
    // Ensure something is selected so "Save" isn't a no-op
    if (!activeAddressId.value) {
      activeAddressId.value = addresses[0]?.id ?? null
    }
  },
  { immediate: true },
)

// Function to set the active address
const setActiveAddress = (addressId: number) => {
  activeAddressId.value = addressId
}

const handleSave = async () => {
  if (!activeAddressId.value) {
    toast.add({
      title: 'Select an address',
      description: 'Please select a shipping address to continue.',
      color: 'red',
    })
    return
  }

  isSubmit.value = true
  try {
    const { error }: any = await useFetch(
      `/api/profiles/addresses/${activeAddressId.value}/save`,
      { method: 'PATCH' },
    )
    if (error.value) {
      throw new Error(error.value?.data?.message || 'Failed to save address')
    }
    await userStore.getAddress()
    toast.add({
      title: 'Address updated',
      description: 'Your shipping address has been saved.',
      color: 'green',
    })
    emit('close')
  }
  catch (e: any) {
    toast.add({
      title: 'Failed to save address',
      description: e?.message || 'Please try again.',
      color: 'red',
    })
  }
  finally {
    isSubmit.value = false
  }
}
</script>

<template>
  <div>
    <transition
      name="sidebar"
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-300 ease-in"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="props.isOpen"
        class="fixed right-0 top-0 w-96 border-l obotoronika-border-color h-screen z-[999] bg-white dark:bg-dark p-3"
      >
        <div class="flex flex-col justify-between">
          <div>
            <h3 class="obotoronika-title font-medium">
              Shipping Address
            </h3>
            <p class="text-xs obotoronika-muted-text mt-1">
              Select an address to use for this order.
            </p>
          </div>
          <div class="flex flex-col gap-4 mt-6 h-[85vh] overflow-y-auto">
            <div v-if="!hasAddresses" class="border rounded-md obotoronika-border-color p-3">
              <p class="text-sm obotoronika-text-color">
                No saved addresses found.
              </p>
              <p class="text-xs obotoronika-muted-text mt-1">
                Add an address from your profile to continue checkout.
              </p>
              <NuxtLink to="/user/addresses" class="inline-block mt-3">
                <UButton
                  label="Add address"
                  size="sm"
                  color="primary"
                  variant="outline"
                />
              </NuxtLink>
            </div>

            <div
              v-for="address in userStore.addresses"
              v-else
              :key="address.id"
              :class="[
                'border rounded-md p-3 cursor-pointer',
                address.id === activeAddressId ? 'border-green-500' : 'obotoronika-border-color',
              ]"
              @click="setActiveAddress(address.id)"
            >
              <p class="font-medium obotoronika-text-color flex justify-between items-center text-sm">
                <span>{{ address.fullname }}</span>
                <span>{{ address.phone }}</span>
              </p>
              <p
                v-if="address.is_default"
                class="text-xs capitalize border w-fit rounded-md border-green-500 text-green-500 px-2 mt-1"
              >
                Default
              </p>
              <p class="mt-2 text-sm obotoronika-text-color">
                <span
                  v-if="address.address_type === 'home'"
                  class="bg-primary text-white px-1 rounded-md capitalize text-xs h-fit"
                >{{ address.address_type }}</span>
                <span
                  v-else
                  class="bg-gray-800 text-white px-1 rounded-md capitalize text-xs h-fit"
                >{{ address.address_type }}</span>
                {{ address.address }}
              </p>
              <p class="text-xs obotoronika-text-color capitalize">
                {{ address.city }}, {{ address.region }}
              </p>
            </div>
          </div>
          <div>
            <div
              class="flex gap-2 mt-4 border-t obotoronika-border-color p-2 justify-end"
            >
              <UButton
                label="Cancel"
                size="lg"
                color="white"
                @click="emit('close')"
              />
              <UButton
                label="Save"
                size="lg"
                :loading="isSubmit"
                :disabled="!hasAddresses"
                @click="handleSave"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
