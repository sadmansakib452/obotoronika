<script lang="ts" setup>
import { Heart, Trash2 } from 'lucide-vue-next'
import { UButton } from '#components'

const props = defineProps<{
  products: Product[]
}>()

const openAddress = ref(false)

const userStore = useUserStore()

// @ts-ignore
await userStore.getAddress()
const config = useRuntimeConfig()

const address = userStore.address

const handleAddress = () => {
  openAddress.value = !openAddress.value
}
</script>

<template>
  <div class="col-span-8">
    <div class="border rounded-md obotoronika-border-color p-4 mb-4">
      <div class="flex justify-between">
        <h3 class="font-medium obotoronika-title -mt-1">
          Shipping & Billing
        </h3>
        <UButton
          icon="i-heroicons-pencil-square"
          size="sm"
          color="primary"
          variant="outline"
          label="Edit"
          :trailing="false"
          @click="handleAddress"
        />
      </div>
      <div class="mt-0 obotoronika-text">
        <div class="flex gap-4">
          <span class="font-medium obotoronika-text">{{ address.name }}</span>
          <span>{{ address.phone }}</span>
        </div>
        <div class="flex gap-3 mt-1 items-center">
          <b
            class="bg-primary text-white px-1 rounded-md capitalize text-xs h-fit font-normal"
          >{{ address.type }}</b>
          <span>{{ address.address }},
            <span class="capitalize">{{ address.city }}, {{ address.region }}</span></span>
        </div>
      </div>
    </div>
    <div class="border rounded-md obotoronika-border-color">
      <div
        v-for="item in props.products"
        :key="item.id"
        class="border-b p-4 last-of-type:border-b-0 grid grid-cols-12 gap-2"
      >
        <div class="flex gap-3 items-center col-span-6">
          <img
            :src="`${config.public.mediaUrl}${item.thumbnail}`"
            :alt="item.title"
            class="w-20 h-20 rounded-md object-cover border"
          >
          <div>
            <h3 class="font-medium obotoronika-title">
              {{ item.title }}
            </h3>
            <div v-for="(variant, index) in item.variants" :key="index">
              <span v-if="variant && Object.keys(variant)[0].includes('color')" class="text-xs block">Color: {{ variant[Object.keys(variant)[0]].label }}</span>
              <span v-if="variant && Object.keys(variant)[0].includes('size')" class="text-xs block">Size: {{ variant[Object.keys(variant)[0]].label }}</span>
            </div>
          </div>
        </div>
        <div class="col-span-6 flex justify-between items-center">
          <div class="text-center flex items-center justify-center flex-col">
            <span class="text-xs block">Tk
              {{ item.offer_price?.toFixed(2) || item.price.toFixed(2) }}
              BDT</span>
            <del
              v-if="item.offer_price"
              class="ps-1.5 text-xs block obotoronika-muted-text"
            >Tk {{ item.price.toFixed(2) }} BDT</del>
            <div class="flex gap-2 mt-2">
              <button>
                <Trash2 class="w-5 obotoronika-text-color" />
              </button>
              <button>
                <Heart class="w-5 obotoronika-text-color" />
              </button>
            </div>
          </div>
          <span class="obotoronika-muted-text text-sm">
            Qty: {{ item.quantity }}
          </span>
        </div>
      </div>
    </div>
    <AddressSidebar :is-open="openAddress" @close="openAddress = false" />
  </div>
</template>
