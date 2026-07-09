import { useAuthStore } from '@/stores/auth'

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const session = useSupabaseSession()
  const { role, fetchUserRole } = useAuth()
  const requiredRole = (to.meta.roles as string[]) || []
  const authStore = useAuthStore()

  // Avoid hammering Supabase Auth on every route change (can trigger rate limits)
  await callOnce('auth-user', async () => await authStore.fetchUser())
  await callOnce('auth-role', async () => await fetchUserRole())

  if (to.path === '/dashboard' && !session.value) {
    return navigateTo('/')
  }

  if (requiredRole.length > 0 && !requiredRole.includes(role.value as string)) {
    return navigateTo('/')
  }
})
