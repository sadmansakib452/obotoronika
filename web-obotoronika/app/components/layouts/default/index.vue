<script lang="ts" setup>
// @ts-ignore
import { useSupabaseUser } from '#imports'
import { usePendingActionAfterLogin } from '@/composables/usePendingActionAfterLogin'
import { useLoginModal } from '@/composables/useLoginModal'
import { UModal } from '#components'

const route = useRoute()
const user = useSupabaseUser()
const { isOpen: isLoginModalOpen, close: closeLoginModal } = useLoginModal()
const { consumePendingAction, setRunningProductId } = usePendingActionAfterLogin()
const toast = useToast()
const productsStore = useProductsStore()

const pendingAction = ref<ReturnType<typeof consumePendingAction>>(null)

const showCustomerLayout = computed(() =>
  ['/user', '/orders', '/reviews'].some(p =>
    route.path.startsWith(p),
  ),
)

onMounted(() => {
  if (import.meta.client) {
    pendingAction.value = consumePendingAction()
    // User may already be set when session restores; run immediately if so (watch also fetches wishlist when user is set)
    if (user?.value && pendingAction.value) {
      runPendingAction()
    }
  }
})

async function runPendingAction() {
  const action = pendingAction.value
  if (!action || !user?.value) return

  // Set the running product ID so buttons can show loading state
  setRunningProductId(action.productId)

  try {
    if (action.type === 'wishlist') {
      await $fetch('/api/products/wishlist', {
        method: 'POST',
        body: { product_id: action.productId },
      })
      await productsStore.fetchWishlist()
      toast.add({ title: 'Added to wishlist', color: 'green' })
    }
    else if (action.type === 'cart') {
      await $fetch('/api/products/cart', {
        method: 'POST',
        body: {
          product_id: action.productId,
          quantity: action.quantity ?? 1,
          variants: action.variants ?? {},
        },
      })
      await productsStore.fetchCart()
      toast.add({ title: 'Added to cart', color: 'green' })
    }
  }
  catch (error) {
    console.error('Error running pending action after login:', error)
  }
  finally {
    setRunningProductId(null)
    pendingAction.value = null
  }
}

watch(user, (u) => {
  if (u) {
    // Populate wishlist so product card hearts show correct state (e.g. after login or session restore)
    productsStore.fetchWishlist()
    if (pendingAction.value) {
      runPendingAction()
    }
  }
}, { immediate: true })

function handleGlobalLoginSuccess() {
  closeLoginModal()
  if (import.meta.client) {
    window.location.reload()
  }
}
</script>

<template>
  <div>
    <LayoutsDefaultHeader v-if="!showCustomerLayout" />
    <slot />
    <LayoutsDefaultFooter />

    <!-- Global login modal (e.g. for wishlist on product cards when not logged in) -->
    <UModal v-model="isLoginModalOpen" :ui="{ width: 'w-full sm:max-w-lg', container: 'items-center' }">
      <Auth @login-success="handleGlobalLoginSuccess" />
    </UModal>
  </div>
</template>
