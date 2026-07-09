<script lang="ts" setup>
definePageMeta({
  layout: false,
})

const route = useRoute()
const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const config = useRuntimeConfig().public.supabase as { cookieName?: string }
const redirectCookieName = `${config?.cookieName ?? 'sb'}-redirect-path`
const redirectCookie = useCookie<string | null>(redirectCookieName)

function closeWindow() {
  if (typeof window !== 'undefined') window.close()
}

// Handle OAuth errors in URL (e.g. user cancelled)
if (import.meta.client) {
  const error = route.query.error as string | undefined
  const errorDescription = route.query.error_description as string | undefined
  if (error) {
    status.value = 'error'
    errorMessage.value = errorDescription || error || 'Login was cancelled or failed.'
  }
}

// The OAuth callback returns a `code` query param. If the server-side exchange isn't configured
// (or custom domain rules prevent verifier cookie use), exchange the code on the client.
// supabase-js reads the PKCE verifier from storage.

async function exchangeCodeIfNeeded() {
  if (!import.meta.client) return
  if (status.value === 'error') return
  if (user.value?.id) return
  const code = route.query.code as string | undefined
  if (!code) return

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    status.value = 'error'
    errorMessage.value = error.message || 'Could not complete sign in. Please try again from the login page.'
  }
}

// Timeout: if still loading with no user after 15s, show error
onMounted(() => {
  exchangeCodeIfNeeded()
  const t = setTimeout(() => {
    if (status.value === 'loading' && !user.value?.id) {
      status.value = 'error'
      errorMessage.value = 'Sign in is taking too long. Please try again from the login page.'
    }
  }, 15000)
  onUnmounted(() => clearTimeout(t))
})

watch(user, async (u) => {
  if (import.meta.server || status.value === 'error') return
  if (!u?.id) return

  const savedPath = redirectCookie?.value
  const next = (savedPath ? String(savedPath) : null) || (route.query.next as string) || '/'
  if (savedPath) redirectCookie.value = null

  try {
    await $fetch('/api/auth/post-login', { method: 'POST', credentials: 'include' })
    const authStore = useAuthStore()
    await authStore.fetchUser()
    status.value = 'success'
    await navigateTo(next)
  }
  catch (e) {
    status.value = 'error'
    errorMessage.value = 'Could not complete sign in. Please try again from the login page.'
  }
}, { immediate: true })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow">
      <div v-if="status === 'loading'" class="space-y-4">
        <div class="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p class="text-sm text-gray-600">
          Completing sign in...
        </p>
      </div>
      <div v-else-if="status === 'success'" class="space-y-2">
        <p class="text-sm text-green-600">
          Sign in successful. Redirecting...
        </p>
      </div>
      <div v-else class="space-y-4">
        <p class="text-sm text-red-600">
          {{ errorMessage }}
        </p>
        <div class="flex flex-wrap gap-2 justify-center">
          <NuxtLink
            to="/"
            class="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
          >
            Go home
          </NuxtLink>
          <button
            type="button"
            class="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
            @click="closeWindow"
          >
            Close window
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
