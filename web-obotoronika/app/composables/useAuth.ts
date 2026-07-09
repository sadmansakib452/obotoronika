// @ts-nocheck
import { useSupabaseUser } from '#imports'

export const useAuth = () => {
  const role = useState<string | null>('role', () => null)

  const socialLogin = async (provider: 'facebook' | 'google') => {
    if (import.meta.server) return
    const supabase = useSupabaseClient()
    // Use the Nuxt page callback (PKCE exchange happens on the client there).
    const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : ''

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('OAuth error:', error)
      throw error
    }

    console.log('data', data)
  }

  const fetchUserRole = async () => {
    const user = useSupabaseUser()
    role.value = user?.value?.user_metadata?.role as string | null
  }

  return { fetchUserRole, socialLogin, role }
}
