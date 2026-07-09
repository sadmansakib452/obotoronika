<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { Heart, Minus, Plus, Trash2 } from 'lucide-vue-next'
import { UButton, UCheckbox } from '#components'

const props = defineProps<{
  products: CartItem[]
  unavailable: CartItem[]
}>()

const config = useRuntimeConfig()
const store = useProductsStore()

// Computed property to check if all items are selected
const allSelected = computed(
  () => store.selectedCart.length === props.products.length,
)

// Computed property for the count of selected items
const selectedCount = computed(() => store.selectedCart.length)

// Toggle all checkboxes
const toggleAll = () => {
  if (allSelected.value) {
    store.selectedCart = [] // Clear all selected items
  }
  else {
    store.selectedCart = [...props.products] // Add all items to selectedCart
  }
}

// Toggle individual checkbox
const toggleItem = (item: CartItem) => {
  const index = store.selectedCart.findIndex(
    cartItem => cartItem.id === item.id,
  )
  if (index !== -1) {
    store.selectedCart.splice(index, 1) // Remove the item if already selected
  }
  else {
    store.selectedCart.push(item) // Add the full item if not selected
  }
}

// Timeout map to handle debounce for each product
const updateTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Handle quantity change with debounce
const handleQuantityChange = (item: CartItem, newQuantity: number) => {
  if (newQuantity < 1) return // Prevent quantity from going below 1
  item.quantity = newQuantity // Update the quantity locally

  // Clear any existing timeout for this product
  if (updateTimeouts.has(item.product_id)) {
    clearTimeout(updateTimeouts.get(item.product_id))
  }

  // Set a new timeout to update the store after 1.5 seconds
  const timeout = setTimeout(async () => {
    try {
      await store.updateCartQuantity(item.product_id, newQuantity)

      // Update the specific item in store.selectedCart after the API call
      const updatedItemIndex = store.selectedCart.findIndex(
        cartItem => cartItem.id === item.id,
      )
      if (updatedItemIndex !== -1) {
        // @ts-ignore
        store.selectedCart[updatedItemIndex].quantity = newQuantity
      }
    }
    catch (error) {
      console.error('Error updating cart quantity:', error)
    }
    finally {
      updateTimeouts.delete(item.product_id) // Clear the timeout reference
    }
  }, 1500)

  updateTimeouts.set(item.product_id, timeout)
}

// Handle item removal
const handleRemoveItem = async (id: string) => {
  try {
    await store.removeCart(id)

    const index = store.selectedCart.findIndex(
      item => item.product_id === id,
    )
    if (index !== -1) {
      store.selectedCart.splice(index, 1)
    }
  }
  catch (error) {
    console.error('Error removing item from cart:', error)
  }
}

// Delete all selected items (single API call)
const isDeletingSelected = ref(false)
const handleDeleteSelected = async () => {
  if (store.selectedCart.length === 0) return
  isDeletingSelected.value = true
  const productIds = store.selectedCart.map(item => item.product_id)
  try {
    await store.removeCartMany(productIds)
    store.selectedCart = []
  }
  catch (error) {
    console.error('Error removing selected items from cart:', error)
  }
  finally {
    isDeletingSelected.value = false
  }
}
</script>

<template>
  <div class="lg:col-span-8">
    <!-- Header with "Select All" checkbox -->
    <div
      class="border obotoronika-border-color p-3 rounded-md mb-1 flex justify-between dark:bg-dark"
    >
      <div class="obotoronika-text-color flex gap-2 items-center">
        <UCheckbox :checked="allSelected" @change="toggleAll" />
        <p class="text-sm">
          {{ selectedCount ? `${selectedCount} Items selected` : "Select all" }}
        </p>
      </div>
      <UButton
        icon="i-heroicons-trash"
        size="sm"
        color="rose"
        variant="outline"
        :label="isDeletingSelected ? 'Deleting...' : 'Delete selected'"
        :trailing="false"
        :disabled="selectedCount === 0 || isDeletingSelected"
        :loading="isDeletingSelected"
        @click="handleDeleteSelected"
      />
    </div>

    <!-- Product List -->
    <div class="border rounded-md obotoronika-border-color dark:bg-dark">
      <div
        v-for="item in props.products"
        :key="item.id"
        class="border-b p-2.5 last-of-type:border-b-0 grid grid-cols-12 gap-2"
      >
        <div class="flex gap-3 items-center col-span-6">
          <!-- Individual Checkbox -->
          <UCheckbox
            :checked="
              store.selectedCart.some((cartItem) => cartItem.id === item.id)
            "
            @change="toggleItem(item)"
          />
          <img
            :src="`${config.public.mediaUrl}${item.product.thumbnail}`"
            :alt="item.product.title"
            class="w-20 h-20 rounded-md object-cover border"
          >
          <div>
            <h3 class="font-medium obotoronika-title">
              {{ item.product.title }}
            </h3>
            <div v-for="(variant, index) in item.variants" :key="index">
              <span v-if="Object.keys(variant)[0]?.includes('color')" class="text-xs block">Color: {{ variant[Object.keys(variant)[0]!].label }}</span>
              <span v-if="Object.keys(variant)[0]?.includes('size')" class="text-xs block">Size: {{ variant[Object.keys(variant)[0]!].label }}</span>
            </div>
          </div>
        </div>
        <div class="col-span-6 flex justify-between items-center">
          <div class="text-center flex items-center justify-center flex-col">
            <span class="text-xs block">Tk
              {{
                item.product.offer_price?.toFixed(2)
                  || item.product.price.toFixed(2)
              }}
              BDT</span>
            <del
              v-if="item.product.offer_price"
              class="ps-1.5 text-xs block obotoronika-muted-text"
            >Tk {{ item.product.price.toFixed(2) }} BDT</del>
            <div class="flex gap-2 mt-2">
              <button @click="handleRemoveItem(item.product_id)">
                <Trash2 class="w-5 obotoronika-text-color" />
              </button>
              <button>
                <Heart class="w-5 obotoronika-text-color" />
              </button>
            </div>
          </div>
          <div
            class="flex obotoronika-border-color border gap-2 w-28 h-10 rounded-md justify-between px-2"
          >
            <button
              class="w-6 text-center"
              @click="handleQuantityChange(item, item.quantity - 1)"
            >
              <Minus :size="20" />
            </button>

            <!-- Editable Quantity Input -->
            <input
              v-model.number="item.quantity"
              type="number"
              class="min-w-[1.5rem] text-center border-none outline-none max-w-10"
              @input="handleQuantityChange(item, item.quantity)"
            >

            <button
              class="w-6 text-center"
              @click="handleQuantityChange(item, item.quantity + 1)"
            >
              <Plus :size="20" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Unavailable Products -->
    <div v-if="unavailable.length" class="mt-8">
      <div
        class="border obotoronika-border-color p-3 rounded-md mb-1 flex justify-between items-center"
      >
        <p class="obotoronika-text-color text-sm">
          Unavailable items ({{ unavailable.length }})
        </p>
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-trash"
            size="sm"
            color="rose"
            variant="outline"
            label="Delete all"
            :trailing="false"
          />
          <UButton
            icon="i-heroicons-heart"
            size="sm"
            color="primary"
            variant="outline"
            label="Save all"
            :trailing="false"
          />
        </div>
      </div>
      <div class="border rounded-md obotoronika-border-color">
        <div
          v-for="item in props.unavailable"
          :key="item.id"
          class="border-b p-2.5 last-of-type:border-b-0 flex gap-2 items-center justify-between"
        >
          <div class="flex gap-3 items-center">
            <!-- Individual Checkbox -->
            <UCheckbox disabled />
            <img
              :src="`${config.public.mediaUrl}${item.product.thumbnail}`"
              :alt="item.product.title"
              class="w-20 h-20 rounded-md object-cover border"
            >
            <div>
              <h3 class="font-medium obotoronika-title">
                {{ item.product.title }}
              </h3>
              <div>
                <template v-for="(variant, vIdx) in item.variants" :key="vIdx">
                  <span v-if="variant && Object.keys(variant).length" class="text-xs block">{{ variant[Object.keys(variant)[0]]?.label }}</span>
                </template>
              </div>
            </div>
          </div>
          <div class="text-center flex items-center justify-center flex-col">
            <span class="text-xs block">Tk
              {{
                item.product.offer_price?.toFixed(2)
                  || item.product.price.toFixed(2)
              }}
              BDT</span>
            <del
              v-if="item.product.offer_price"
              class="ps-1.5 text-xs block obotoronika-muted-text"
            >Tk {{ item.product.price.toFixed(2) }} BDT</del>
            <div class="flex gap-2 mt-2">
              <button @click="handleRemoveItem(item.product_id)">
                <Trash2 class="w-5 obotoronika-text-color" />
              </button>
              <button>
                <Heart class="w-5 obotoronika-text-color" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
