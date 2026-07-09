<script setup lang="ts">
import { UButton, UIcon } from '#components'

const route = useRoute()
const router = useRouter()
const toast = useToast()

interface PaymentMethod {
  key: string
  label: string
  icon: string
  isImage?: boolean
  brandColor: string
  tag: string
}

const paymentMethods: PaymentMethod[] = [
  {
    key: 'bkash',
    label: 'bKash',
    icon: 'arcticons:bkash',
    brandColor: '#de166e',
    tag: 'Online Payment',
  },
  {
    key: 'nagad',
    label: 'Nagad',
    icon: 'arcticons:nagad',
    brandColor: '#f69220',
    tag: 'Online Payment',
  },
  {
    key: 'dbblmobilebanking',
    label: 'Rocket',
    icon: '/images/rocket.png',
    isImage: true,
    brandColor: '#1a1a2e',
    tag: 'Online Payment',
  },
  {
    key: 'cash',
    label: 'Cash on Delivery',
    icon: 'mdi:cash',
    brandColor: '#059669',
    tag: 'Pay at Doorstep',
  },
]

const isLoading = ref(false)
const isGatewayLoaded = ref(false)
const selectedMethod = ref<string | null>(null)
const orderID = route.query.orderID ?? ''
const gatewayURLs = ref<Record<string, any>>({})
const orderData = ref<any>(null)

const isDisableButton = computed(() => {
  if (selectedMethod.value === 'cash') return false
  if (selectedMethod.value === null) return true
  return !isGatewayLoaded.value
})

const itemCount = computed(() => orderData.value?.items?.length || 0)
const subtotal = computed(() => orderData.value?.total_amount || 0)
const total = computed(() => orderData.value?.total_amount || 0)

const buttonLabel = computed(() => {
  if (!selectedMethod.value) return 'Select a payment method'
  if (selectedMethod.value === 'cash') return 'Confirm Order'
  const method = paymentMethods.find(m => m.key === selectedMethod.value)
  return `Pay with ${method?.label ?? ''}`
})

const handleProceed = async () => {
  if (!selectedMethod.value || !orderID) return

  isLoading.value = true

  try {
    if (selectedMethod.value === 'cash') {
      const { data, error } = await useFetch('/api/orders/checkout', {
        method: 'PATCH',
        body: {
          order_id: orderID,
          payment_method: 'cod',
          payment_info: '{}',
        },
      })

      if (error.value) throw new Error(error.value.message)

      router.push(`/order-received?orderID=${orderID}`)
    }
    else {
      const url = gatewayURLs.value[selectedMethod.value]?.redirectGatewayURL
      if (url) {
        location.href = url
      }
      else {
        throw new Error('Payment gateway URL not available')
      }
    }
  }
  catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to process payment',
      color: 'red',
      icon: 'i-heroicons-exclamation-circle',
    })
  }
  finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!orderID) {
    isGatewayLoaded.value = true
    return
  }

  try {
    const { data: orderRes } = await useFetch(`/api/orders/${orderID}`)
    if (orderRes.value?.success) {
      orderData.value = orderRes.value.data.order
    }
  }
  catch (e) {
    console.error('Failed to fetch order details:', e)
  }

  try {
    const { data, error } = await useFetch(`/api/payment?order_id=${orderID}`)
    if (!error.value && data.value?.data) {
      gatewayURLs.value = data.value.data
    }
  }
  catch (e) {
    console.error('Failed to fetch payment gateways:', e)
  }

  isGatewayLoaded.value = true
})

useHead({
  title: 'Checkout | Obotoronika',
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 px-4">
    <div class="max-w-lg mx-auto">
      <!-- Top bar -->
      <div class="flex items-center justify-between mb-8">
        <button
          class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          @click="router.back()"
        >
          <UIcon name="i-heroicons-arrow-left-20-solid" class="w-4 h-4" />
          Back
        </button>
        <span class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <UIcon name="i-heroicons-lock-closed" class="w-3 h-3" />
          Secure Checkout
        </span>
      </div>

      <!-- Brand -->
      <div class="flex justify-center mb-6">
        <AtomsLogo :width="80" :height="48" fill="#FF9C01" />
      </div>

      <!-- Heading -->
      <h1 class="text-center text-xl font-semibold text-gray-900 dark:text-white mb-8">
        Choose your payment method
      </h1>

      <!-- Payment method cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div
          v-for="method in paymentMethods"
          :key="method.key"
          role="button"
          tabindex="0"
          class="relative rounded-xl p-4 cursor-pointer transition-all duration-200 border-2 text-center select-none"
          :class="selectedMethod === method.key
            ? 'border-gray-900 dark:border-white bg-white dark:bg-gray-800 shadow-lg scale-[1.02]'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'"
          @click="selectedMethod = method.key"
          @keydown.enter="selectedMethod = method.key"
          @keydown.space.prevent="selectedMethod = method.key"
        >
          <!-- Radio indicator -->
          <div
            class="absolute top-2 right-2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
            :class="selectedMethod === method.key
              ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white'
              : 'border-gray-300 dark:border-gray-600'"
          >
            <div
              v-if="selectedMethod === method.key"
              class="w-1.5 h-1.5 rounded-full bg-white dark:bg-gray-900"
            />
          </div>

          <!-- Icon -->
          <div v-if="method.isImage" class="w-10 h-10 mx-auto mb-2">
            <img
              :src="method.icon"
              class="w-full h-full object-contain transition-all duration-300"
              :class="selectedMethod === method.key ? '' : 'grayscale opacity-50'"
              alt=""
            >
          </div>
          <div v-else class="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
            <UIcon
              :name="method.icon"
              class="w-8 h-8 transition-all duration-300"
              :class="selectedMethod === method.key ? '' : 'text-gray-300 dark:text-gray-600'"
              :style="selectedMethod === method.key ? { color: method.brandColor } : {}"
            />
          </div>

          <!-- Label -->
          <span
            class="block text-sm font-semibold mb-1"
            :class="selectedMethod === method.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
          >
            {{ method.label }}
          </span>

          <!-- Tag -->
          <span
            class="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium"
            :class="selectedMethod === method.key
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'"
          >
            {{ method.tag }}
          </span>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Order Summary
        </h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal ({{ itemCount }} items)</span>
            <span>{{ subtotal }} BDT</span>
          </div>
          <div class="flex justify-between font-semibold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
            <span>Total</span>
            <span>{{ total }} BDT</span>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <UButton
        block
        size="xl"
        :loading="isLoading"
        :disabled="isDisableButton || !selectedMethod"
        class="rounded-xl font-semibold !py-3.5 transition-all duration-200"
        :class="selectedMethod === 'cash'
          ? '!bg-emerald-600 hover:!bg-emerald-700 !text-white'
          : '!bg-gray-900 hover:!bg-gray-800 dark:!bg-white dark:hover:!bg-gray-200 dark:!text-gray-900'"
        @click="handleProceed"
      >
        {{ buttonLabel }}
      </UButton>

      <!-- Redirect hint -->
      <p
        v-if="selectedMethod && selectedMethod !== 'cash'"
        class="text-center text-xs text-gray-400 dark:text-gray-500 mt-3"
      >
        You'll be redirected to {{ paymentMethods.find(m => m.key === selectedMethod)?.label }}'s secure payment page
      </p>
    </div>
  </div>
</template>
