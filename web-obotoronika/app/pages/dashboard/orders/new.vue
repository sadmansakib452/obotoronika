<script setup lang="ts">
import { UButton, UCard, UInput, UIcon, UTextarea, UBadge, USelectMenu, UModal, UCheckbox } from '#components'

useHead({ title: 'Create Order | Dashboard | Obotoronika' })

// ── Customer ────────────────────────────────────────────────────
const customerQuery = ref('')
const customerResults = ref<any[]>([])
const selectedCustomer = ref<any | null>(null)
const isGuest = ref(false)
const guestName = ref('')
const guestPhone = ref('')
const guestEmail = ref('')
let customerSearchTimeout: ReturnType<typeof setTimeout> | null = null

const watchCustomerQuery = (q: string) => {
  if (customerSearchTimeout) clearTimeout(customerSearchTimeout)
  if (!q.trim()) {
    customerResults.value = []
    return
  }
  customerSearchTimeout = setTimeout(async () => {
    try {
      const res: any = await $fetch('/api/dashboard/users', {
        query: { q, filterBy: JSON.stringify({ role: 'customer' }), perPage: 10 },
      })
      customerResults.value = res.data?.users || []
    }
    catch {
      customerResults.value = []
    }
  }, 400)
}

function selectCustomer(user: any) {
  selectedCustomer.value = user
  customerQuery.value = `${user.user_metadata?.name || ''} (${user.email || user.phone || ''})`
  customerResults.value = []
  isGuest.value = false
}

function switchToGuest() {
  selectedCustomer.value = null
  customerQuery.value = ''
  customerResults.value = []
  isGuest.value = true
}

function switchToExisting() {
  isGuest.value = false
  guestName.value = ''
  guestPhone.value = ''
  guestEmail.value = ''
}

// ── Products ────────────────────────────────────────────────────
const productQuery = ref('')
const productResults = ref<any[]>([])
const cartItems = ref<any[]>([])
let productSearchTimeout: ReturnType<typeof setTimeout> | null = null

const watchProductQuery = (q: string) => {
  if (productSearchTimeout) clearTimeout(productSearchTimeout)
  if (!q.trim()) {
    productResults.value = []
    return
  }
  productSearchTimeout = setTimeout(async () => {
    try {
      const res: any = await $fetch('/api/products/search', { query: { q, limit: 10 } })
      productResults.value = res.data?.products || []
    }
    catch {
      productResults.value = []
    }
  }, 400)
}

// Product selection dialog
const showProductDialog = ref(false)
const selectedProduct = ref<any | null>(null)
const selectedVariants = ref<string>('')
const productQuantity = ref(1)

function openProductDialog(product: any) {
  selectedProduct.value = product
  selectedVariants.value = ''
  productQuantity.value = 1
  showProductDialog.value = true
}

function addProductToOrder() {
  if (!selectedProduct.value || productQuantity.value < 1) return

  const existing = cartItems.value.findIndex(
    (item: any) => item.product_id === selectedProduct.value.id && item.variants === selectedVariants.value,
  )

  if (existing >= 0) {
    cartItems.value[existing].quantity += productQuantity.value
  }
  else {
    cartItems.value.push({
      product_id: selectedProduct.value.id,
      title: selectedProduct.value.title,
      thumbnail: selectedProduct.value.thumbnail,
      quantity: productQuantity.value,
      variants: selectedVariants.value,
    })
  }

  showProductDialog.value = false
  selectedProduct.value = null
  productQuantity.value = 1
  selectedVariants.value = ''
  productQuery.value = ''
  productResults.value = []
}

function removeCartItem(index: number) {
  cartItems.value.splice(index, 1)
}

const cartTotal = computed(() =>
  cartItems.value.reduce((sum: number, item: any) => sum + item.quantity, 0),
)

// ── Address ─────────────────────────────────────────────────────
const savedAddresses = ref<any[]>([])
const selectedAddressId = ref<number | null>(null)
const useCustomAddress = ref(false)

const addressForm = reactive({
  fullname: '',
  phone: '',
  city: '',
  region: '',
  address: '',
  address_type: 'home' as 'home' | 'office',
})

async function fetchAddresses() {
  if (!selectedCustomer.value?.id) return
  try {
    const res: any = await $fetch(`/api/dashboard/users/${selectedCustomer.value.id}/addresses`)
    savedAddresses.value = res.data || []
  }
  catch {
    savedAddresses.value = []
  }
}

watch(() => selectedCustomer.value, (val) => {
  if (val) {
    useCustomAddress.value = false
    selectedAddressId.value = null
    fetchAddresses()
  }
})

function applyAddress(addr: any) {
  addressForm.fullname = addr.fullname
  addressForm.phone = addr.phone
  addressForm.city = addr.city
  addressForm.region = addr.region
  addressForm.address = addr.address
  addressForm.address_type = addr.address_type
}

watch(selectedAddressId, (id) => {
  if (id) {
    const addr = savedAddresses.value.find(a => a.id === id)
    if (addr) applyAddress(addr)
  }
})

// ── Notes ───────────────────────────────────────────────────────
const notes = ref('')

// ── Submit ───────────────────────────────────────────────────────
const isCreating = ref(false)
const createError = ref('')
const createSuccess = ref(false)
const createdOrder = ref<any>(null)

async function createOrder() {
  createError.value = ''

  // Validation
  if (!isGuest.value && !selectedCustomer.value) {
    createError.value = 'Select a customer or enable guest order'
    return
  }

  if (isGuest.value && (!guestName.value.trim() || !guestPhone.value.trim())) {
    createError.value = 'Guest name and phone are required'
    return
  }

  if (cartItems.value.length === 0) {
    createError.value = 'Add at least one product to the order'
    return
  }

  if (!addressForm.phone.trim() || !addressForm.city.trim() || !addressForm.address.trim()) {
    createError.value = 'Shipping address (phone, city, address) is required'
    return
  }

  isCreating.value = true

  try {
    const body: Record<string, any> = {
      items: cartItems.value.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        variants: item.variants ? [{ info: item.variants }] : [],
      })),
      shippingAddress: {
        fullname: addressForm.fullname,
        phone: addressForm.phone,
        city: addressForm.city,
        region: addressForm.region,
        address: addressForm.address,
        address_type: addressForm.address_type,
      },
      notes: notes.value || undefined,
    }

    if (isGuest.value) {
      body.shippingAddress.fullname = guestName.value
      body.shippingAddress.phone = guestPhone.value
      body.shippingAddress.email = guestEmail.value || undefined
    }
    else {
      body.customerId = selectedCustomer.value.id
    }

    const res: any = await $fetch('/api/dashboard/orders', {
      method: 'POST',
      body,
    })

    createdOrder.value = res.data.order
    createSuccess.value = true
  }
  catch (err: any) {
    createError.value = err?.data?.message || err?.message || 'Failed to create order'
  }
  finally {
    isCreating.value = false
  }
}

function resetForm() {
  selectedCustomer.value = null
  customerQuery.value = ''
  isGuest.value = false
  guestName.value = ''
  guestPhone.value = ''
  guestEmail.value = ''
  cartItems.value = []
  productQuery.value = ''
  addressForm.fullname = ''
  addressForm.phone = ''
  addressForm.city = ''
  addressForm.region = ''
  addressForm.address = ''
  addressForm.address_type = 'home'
  selectedAddressId.value = null
  useCustomAddress.value = false
  savedAddresses.value = []
  notes.value = ''
  createSuccess.value = false
  createdOrder.value = null
  createError.value = ''
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold obotoronika-title">Create Order</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manually create an order for a customer
        </p>
      </div>
      <UButton
        v-if="createSuccess"
        color="gray"
        variant="soft"
        label="Create Another"
        @click="resetForm"
      />
    </div>

    <!-- Success Banner -->
    <UCard
      v-if="createSuccess"
      :ui="{ body: { base: 'space-y-3' } }"
    >
      <div class="flex items-center gap-3 text-green-600 dark:text-green-400">
        <UIcon name="i-heroicons-check-circle" class="w-8 h-8" />
        <div>
          <h3 class="font-semibold text-lg">Order Created Successfully</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Order ID: <span class="font-mono font-medium">{{ createdOrder?.order_id }}</span>
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Total: ৳{{ createdOrder?.total_amount }} |
            Type: {{ createdOrder?.is_guest ? 'Guest' : 'Registered Customer' }}
          </p>
        </div>
      </div>
      <div class="flex gap-3 pt-2">
        <UButton
          :to="`/dashboard/orders/${createdOrder?.order_id}`"
          color="primary"
          variant="solid"
          label="View Order"
          size="sm"
        />
        <UButton
          to="/dashboard/orders"
          color="gray"
          variant="soft"
          label="All Orders"
          size="sm"
        />
      </div>
    </UCard>

    <!-- Main Form -->
    <template v-if="!createSuccess">
      <!-- Error Alert -->
      <div
        v-if="createError"
        class="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg"
      >
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 shrink-0" />
        <span>{{ createError }}</span>
      </div>

      <!-- Section 1: Customer -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold obotoronika-title">Customer</h2>
            <div class="flex gap-2">
              <UButton
                :color="isGuest ? 'primary' : 'gray'"
                :variant="isGuest ? 'solid' : 'soft'"
                size="xs"
                label="Guest"
                @click="switchToGuest"
              />
              <UButton
                :color="!isGuest ? 'primary' : 'gray'"
                :variant="!isGuest ? 'solid' : 'soft'"
                size="xs"
                label="Existing"
                @click="switchToExisting"
              />
            </div>
          </div>
        </template>

        <!-- Guest Mode -->
        <div v-if="isGuest" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UInput
            v-model="guestName"
            placeholder="Customer name"
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-gray-400" />
            </template>
          </UInput>
          <UInput
            v-model="guestPhone"
            placeholder="Phone number"
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-phone" class="w-4 h-4 text-gray-400" />
            </template>
          </UInput>
          <UInput
            v-model="guestEmail"
            placeholder="Email (optional)"
            size="lg"
            type="email"
          >
            <template #leading>
              <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-gray-400" />
            </template>
          </UInput>
        </div>

        <!-- Existing Customer Mode -->
        <div v-else>
          <USelectMenu
            v-model="selectedCustomer"
            :searchable="true"
            :searchable-placeholder="'Search by name, email or phone...'"
            :options="customerResults"
            :loading="false"
            option-attribute="email"
            value-attribute="id"
            placeholder="Search customer..."
            class="w-full"
            @search="watchCustomerQuery"
            @update:model-value="selectCustomer"
          >
            <template #option="{ option: user }">
              <div class="flex flex-col">
                <span class="font-medium">{{ user.user_metadata?.name || 'N/A' }}</span>
                <span class="text-xs text-gray-500">{{ user.email || user.phone || '' }}</span>
              </div>
            </template>
          </USelectMenu>

          <!-- Selected Customer Badge -->
          <div
            v-if="selectedCustomer"
            class="mt-3 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <UIcon name="i-heroicons-user" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-sm">{{ selectedCustomer.user_metadata?.name }}</p>
              <p class="text-xs text-gray-500">{{ selectedCustomer.email || selectedCustomer.phone }}</p>
            </div>
            <UButton
              color="gray"
              variant="ghost"
              size="xs"
              icon="i-heroicons-x-mark"
              @click="selectedCustomer = null; customerQuery = ''"
            />
          </div>
        </div>
      </UCard>

      <!-- Section 2: Products -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold obotoronika-title">Products</h2>
        </template>

        <!-- Product Search -->
        <div class="relative">
          <UInput
            v-model="productQuery"
            placeholder="Search products by name..."
            size="lg"
            @update:model-value="watchProductQuery"
          >
            <template #leading>
              <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400" />
            </template>
          </UInput>

          <!-- Search Results Dropdown -->
          <div
            v-if="productResults.length > 0"
            class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-72 overflow-y-auto"
          >
            <button
              v-for="product in productResults"
              :key="product.id"
              class="flex items-center gap-3 w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
              @click="openProductDialog(product)"
            >
              <img
                :src="product.thumbnail || '/placeholder.svg'"
                :alt="product.title"
                class="w-10 h-10 rounded object-cover bg-gray-100"
              >
              <div>
                <p class="font-medium text-sm">{{ product.title }}</p>
                <p class="text-xs text-gray-500">{{ product.slug }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Cart Items Table -->
        <div v-if="cartItems.length > 0" class="mt-4 space-y-2">
          <div
            v-for="(item, index) in cartItems"
            :key="index"
            class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <img
              :src="item.thumbnail || '/placeholder.svg'"
              :alt="item.title"
              class="w-12 h-12 rounded object-cover bg-gray-100 shrink-0"
            >
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate">{{ item.title }}</p>
              <p v-if="item.variants" class="text-xs text-gray-500">
                {{ item.variants }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="font-semibold text-sm">x{{ item.quantity }}</p>
            </div>
            <UButton
              color="red"
              variant="ghost"
              size="xs"
              icon="i-heroicons-trash"
              @click="removeCartItem(index)"
            />
          </div>

          <div class="flex items-center justify-between pt-2 text-sm font-medium">
            <span>{{ cartItems.length }} product{{ cartItems.length !== 1 ? 's' : '' }}</span>
            <span>Total: <strong>{{ cartTotal }} item{{ cartTotal !== 1 ? 's' : '' }}</strong></span>
          </div>
        </div>

        <div v-else class="py-6 text-center text-gray-400">
          <UIcon name="i-heroicons-shopping-cart" class="w-8 h-8 mx-auto mb-2" />
          <p class="text-sm">Search and add products to the order</p>
        </div>
      </UCard>

      <!-- Section 3: Shipping Address -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold obotoronika-title">Shipping Address</h2>
        </template>

        <!-- Saved Addresses (existing customer only) -->
        <div
          v-if="selectedCustomer && savedAddresses.length > 0 && !useCustomAddress"
          class="mb-4 space-y-2"
        >
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Saved Addresses</p>
          <label
            v-for="addr in savedAddresses"
            :key="addr.id"
            class="flex items-start gap-3 p-3 border dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            :class="{ 'border-primary-500 dark:border-primary-400': selectedAddressId === addr.id }"
          >
            <input
              v-model="selectedAddressId"
              type="radio"
              name="saved_address"
              :value="addr.id"
              class="mt-1"
            >
            <div class="flex-1 text-sm">
              <p class="font-medium">{{ addr.fullname }}</p>
              <p class="text-gray-500">{{ addr.phone }}</p>
              <p class="text-gray-500">{{ addr.address }}, {{ addr.city }}, {{ addr.region }}</p>
              <UBadge
                :label="addr.address_type"
                size="xs"
                color="gray"
                variant="soft"
              />
            </div>
          </label>

          <button
            class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            @click="useCustomAddress = true"
          >
            + Enter different address
          </button>
        </div>

        <!-- Address Form -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UInput
            v-model="addressForm.fullname"
            placeholder="Full name"
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-gray-400" />
            </template>
          </UInput>
          <UInput
            v-model="addressForm.phone"
            placeholder="Phone number"
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-phone" class="w-4 h-4 text-gray-400" />
            </template>
          </UInput>
          <UInput
            v-model="addressForm.city"
            placeholder="City"
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-building-office" class="w-4 h-4 text-gray-400" />
            </template>
          </UInput>
          <UInput
            v-model="addressForm.region"
            placeholder="Region / Division"
            size="lg"
          />
          <div class="sm:col-span-2">
            <UTextarea
              v-model="addressForm.address"
              placeholder="Full address"
              :rows="2"
            />
          </div>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="addressForm.address_type"
                type="radio"
                value="home"
              >
              Home
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="addressForm.address_type"
                type="radio"
                value="office"
              >
              Office
            </label>
          </div>
        </div>
      </UCard>

      <!-- Section 4: Notes + Submit -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold obotoronika-title">Notes & Submit</h2>
        </template>

        <div class="space-y-4">
          <UTextarea
            v-model="notes"
            placeholder="Order notes (optional)"
            :rows="2"
          />

          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p class="text-sm text-gray-500">Items: {{ cartTotal }}</p>
              <p class="text-xs text-gray-400">
                {{ selectedCustomer ? `Customer: ${selectedCustomer.user_metadata?.name || ''}` : isGuest ? `Guest: ${guestName}` : 'No customer selected' }}
              </p>
            </div>
            <UButton
              color="primary"
              size="lg"
              :loading="isCreating"
              :disabled="isCreating"
              label="Create Order"
              @click="createOrder"
            />
          </div>
        </div>
      </UCard>
    </template>

    <!-- Product Selection Modal -->
    <UModal v-model="showProductDialog" :ui="{ width: 'w-full max-w-md' }">
      <div class="p-6 space-y-4">
        <div v-if="selectedProduct" class="flex items-center gap-4">
          <img
            :src="selectedProduct.thumbnail || '/placeholder.svg'"
            :alt="selectedProduct.title"
            class="w-20 h-20 rounded-lg object-cover bg-gray-100"
          >
          <div>
            <h3 class="font-semibold">{{ selectedProduct.title }}</h3>
            <p class="text-sm text-gray-500">{{ selectedProduct.slug }}</p>
          </div>
        </div>

        <UInput
          v-model="selectedVariants"
          placeholder="Variants (optional) — e.g. Size: M, Color: Red"
          size="lg"
        >
          <template #leading>
            <UIcon name="i-heroicons-tag" class="w-4 h-4 text-gray-400" />
          </template>
        </UInput>

        <UInput
          v-model.number="productQuantity"
          type="number"
          min="1"
          placeholder="Quantity"
          size="lg"
        >
          <template #leading>
            <UIcon name="i-heroicons-hashtag" class="w-4 h-4 text-gray-400" />
          </template>
        </UInput>

        <div class="flex gap-3 justify-end pt-2">
          <UButton
            color="gray"
            variant="soft"
            label="Cancel"
            @click="showProductDialog = false"
          />
          <UButton
            color="primary"
            label="Add to Order"
            :disabled="productQuantity < 1"
            @click="addProductToOrder"
          />
        </div>
      </div>
    </UModal>
  </div>
</template>
