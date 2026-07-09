/**
 * When useSsrCookies is false, the server never receives the session via cookies.
 * We wrap window.fetch so every request to /api gets the Supabase token, and we
 * also replace $fetch. The fetch wrapper guarantees token is sent even if Nuxt
 * uses a different $fetch reference internally.
 */
export default defineNuxtPlugin({
  name: 'auth-api',
  enforce: 'post',
  setup(nuxtApp) {
    if (import.meta.server) return

    const config = useRuntimeConfig().public
    const supabaseUrl = (config.supabaseUrl as string)?.trim()
    const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : ''
    const storageKey = projectRef ? `sb-${projectRef}-auth-token` : ''

    async function getAccessToken(): Promise<string | null> {
      try {
        const supabase = useSupabaseClient()
        const { data } = await supabase.auth.getSession()
        if (data?.session?.access_token) return data.session.access_token
      }
      catch {
        // fallback: read from localStorage
      }
      if (!storageKey) return null
      try {
        const raw = window.localStorage.getItem(storageKey)
        if (!raw) return null
        const data = JSON.parse(raw) as Record<string, unknown>
        const session
          = (data?.session ?? (data as any)?.data?.session ?? data?.currentSession ?? data) as
          | { access_token?: string }
          | undefined
        return session?.access_token ?? (data?.access_token as string) ?? null
      }
      catch {
        return null
      }
    }

    // Wrap native fetch so ALL requests (including from ofetch/useFetch) get the token
    const originalFetch = window.fetch
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input)
      const isOwnApi = url.startsWith('/api') || url.startsWith(location.origin + '/api')
      if (isOwnApi) {
        const token = await getAccessToken()
        if (token) {
          init = init ?? {}
          const headers = new Headers(init.headers)
          if (!headers.has('authorization')) {
            headers.set('Authorization', `Bearer ${token}`)
          }
          init = { ...init, headers }
        }
      }
      return originalFetch.call(this, input, init)
    }

    // Also replace $fetch so direct $fetch calls use our interceptor
    const authFetch = $fetch.create({
      async onRequest({ request, options }) {
        const url = typeof request === 'string' ? request : (request as Request)?.url ?? ''
        const isOwnApi = url.startsWith('/api') || (typeof url === 'string' && url.startsWith(location.origin + '/api'))
        if (!isOwnApi) return
        const token = await getAccessToken()
        if (!token) return
        const headers = options.headers || (options.headers = new Headers())
        const h = headers instanceof Headers ? headers : new Headers(headers as Record<string, string>)
        if (!h.has('authorization')) {
          h.set('Authorization', `Bearer ${token}`)
          options.headers = h
        }
      },
    })
    nuxtApp.$fetch = authFetch
    nuxtApp.provide('$fetch', authFetch)
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).$fetch = authFetch
    }
  },
})
