<script lang="ts" setup>
import { UNotifications } from '#components'
import AtomsLogo from '@/components/atoms/Logo.vue'

useHead({
  title: 'Obotoronika',
  // description: 'Obotoronika is a modern e-commerce platform designed to deliver fast, seamless shopping with an emphasis on great UI, powerful admin controls, and a smooth customer experience.',
})

// Access the settings store
const settingsStore = useSettingsStore()
const toast = useToast()

watch(
  () => settingsStore.isError,
  (isError) => {
    if (isError) {
      toast.add({
        title: 'Error',
        description: settingsStore.errorMessage || 'An error occurred.',
        color: 'red',
      })
      settingsStore.setIsError(false, '')
    }
  },
)

// ---------------------------------------------------------------------------
// Auth recovery for cross-site POST redirects (e.g. SSLCommerz payment return)
//
// SSLCommerz POSTs to success_url / fail_url / cancel_url.
// SameSite=Lax cookies are NOT sent with cross-site POST requests, so the
// Nuxt server renders those pages without auth cookies → authStore.user = null.
// callOnce('auth-user') is then marked as done and never re-runs on the client.
//
// However, the Supabase JS client reads localStorage after hydration, restores
// the session, and updates useSupabaseUser(). We watch that reactive ref and
// sync it back into authStore so the navbar and all auth-dependent UI update
// correctly without requiring a full page refresh.
// ---------------------------------------------------------------------------
if (import.meta.client) {
  settingsStore.getMenu()

  const authStore = useAuthStore()
  const supabaseUser = useSupabaseUser()
  const { role } = useAuth()

  watch(
    supabaseUser,
    (newUser) => {
      if (newUser && !authStore.user) {
        authStore.user = newUser
        authStore.userRole = (newUser.user_metadata?.role as string) ?? null
        role.value = (newUser.user_metadata?.role as string) ?? null
      }
    },
    { immediate: true },
  )

  const router = useRouter()
  router.beforeEach(() => settingsStore.setIsPageLoading(true))
  router.afterEach(() => settingsStore.setIsPageLoading(false))
}
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="#FC6A03" :height="3" :duration="2000" />
    <NuxtPage class="min-h-[70vh]">
      <template #fallback>
        <div class="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-950">
          <AtomsLogo :bf="true" :width="80" :height="80" fill="#FC6A03" class="animate-pulse" />
          <p class="text-sm text-gray-400 dark:text-gray-600 tracking-wider">Loading…</p>
        </div>
      </template>
    </NuxtPage>
    <UNotifications />
    <ScrollToTop />
    <Preloader />
  </NuxtLayout>
</template>
