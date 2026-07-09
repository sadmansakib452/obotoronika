<script lang="ts" setup>
import { UTable } from '#components'

const props = defineProps<{ items: OrderItem[] }>()

const config = useRuntimeConfig()

const columns = [
  { key: 'product_name', label: 'Product Name' },
  { key: 'price', label: 'Price' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'total', label: 'Total' },
]
</script>

<template>
  <div class="mt-4">
    <UTable :columns="columns" :rows="props.items">
      <template #product_name-data="{ row }">
        <div class="flex gap-2 items-center">
          <img
            :src="`${config.public.mediaUrl}${row.product.thumbnail}`"
            alt=""
            class="w-10 h-10 border obotoronika-border-color rounded-md object-cover"
          >
          <div>
            <h4 class="font-Homenaje obotoronika-title text-lg">
              {{ row.product.title }}
            </h4>
            <div v-for="(variant, index) in row.variants" :key="index">
              <template v-if="variant && Object.keys(variant).length">
                <span v-if="Object.keys(variant)[0].includes('color')" class="text-xs block">Color: {{ variant[Object.keys(variant)[0]].label }}</span>
                <span v-if="Object.keys(variant)[0].includes('size')" class="text-xs block">Size: {{ variant[Object.keys(variant)[0]].label }}</span>
              </template>
            </div>
          </div>
        </div>
      </template>
      <template #price-data="{ row }">
        <p>
          Tk {{ row.price }}
        </p>
      </template>
      <template #total-data="{ row }">
        <p>
          Tk {{ row.price * row.quantity }}
        </p>
      </template>
    </UTable>
    <div>
      <!-- <ul>
            <li>Subtotal: <span>75000</span></li>
            <li>Tax: <span>75000</span></li>
            <li>Discount: <span>75000</span></li>
            <li>Total: <span>75000</span></li>
        </ul> -->
    </div>
  </div>
</template>
