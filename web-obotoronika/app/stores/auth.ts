import { defineStore } from 'pinia'
import type { User } from 'shared/types/user'

type Session = {
  id: string
  device: string
  os: string
  browser: string
  browser_version: string
  ip: string
  last_active: string
  current: boolean
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoading: false,
    userRole: null as string | null | undefined,
    sessions: {
      data: [] as Session[],
      pagination: {
        page: 1,
        perPage: 30,
        total: 0,
        totalPages: 0,
      },
    },
  }),

  actions: {
    async fetchUser() {
      const supabase = useSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      this.userRole = user?.role
      this.user = user
    },

    async signUp(email: string, password: string) {
      const supabase = useSupabaseClient()
      const { error, data } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      this.user = data.user
    },

    async signIn(email: string, password: string) {
      const supabase = useSupabaseClient()
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      this.user = data.user
    },

    async signOut() {
      await useFetch('/api/auth/logout', { method: 'delete' })
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
      this.user = null
      this.userRole = null
    },
    async getSessions() {
      const { data: res }: any = await useFetch(`/api/auth/sessions?perPage=${this.sessions.pagination.perPage}`)
      const data = res.value?.data
      if (data) {
        this.sessions.data = data?.data ?? []
        this.sessions.pagination.page = data.meta.page
        this.sessions.pagination.total = data.meta.total
        this.sessions.pagination.totalPages = data.meta.totalPages
      }
    },
  },
})
