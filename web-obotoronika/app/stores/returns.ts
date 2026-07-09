/**
 * Returns Store - Manages return requests for admin dashboard
 */

export const useReturnsStore = defineStore('returns', {
  state: () => ({
    returns: {
      isLoading: false,
      data: {} as Record<string, any[]>,
      search: '',
      status: '',
      type: '',
      pagination: {
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
      },
    },
  }),

  getters: {
    getReturnsPage: (state) => {
      return (page: number, perPage: number) => {
        const key = state.returns.search
          ? `${page}-${perPage}-${state.returns.search}-${state.returns.status}-${state.returns.type}`
          : `${page}-${perPage}-${state.returns.status}-${state.returns.type}`
        return state.returns.data[key] ?? []
      }
    },
  },

  actions: {
    async fetchReturns(force = false) {
      const { page, perPage } = this.returns.pagination
      const key = this.returns.search
        ? `${page}-${perPage}-${this.returns.search}-${this.returns.status}-${this.returns.type}`
        : `${page}-${perPage}-${this.returns.status}-${this.returns.type}`

      // Skip if already cached and not force refresh
      if (!force && this.returns.data[key]?.length > 0) {
        return
      }

      this.returns.isLoading = true

      try {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('per_page', perPage.toString())
        if (this.returns.search) {
          params.append('search', this.returns.search)
        }
        if (this.returns.status) {
          params.append('status', this.returns.status)
        }
        if (this.returns.type) {
          params.append('type', this.returns.type)
        }

        const res: any = await $fetch(`/api/dashboard/returns?${params.toString()}`)

        const data = res.data
        this.returns.data[key] = data.return_requests
        this.returns.pagination.total = data.meta.total
        this.returns.pagination.page = data.meta.page
        this.returns.pagination.totalPages = data.meta.totalPages
      }
      catch (error) {
        console.error('Failed to fetch returns:', error)
      }
      finally {
        this.returns.isLoading = false
      }
    },

    async setPagination(page: number, perPage: number, force = false) {
      this.returns.pagination.page = page
      this.returns.pagination.perPage = perPage
      await this.fetchReturns(force)
    },

    async setSearch(search: string) {
      this.returns.search = search
      this.returns.pagination.page = 1
      await this.fetchReturns(true)
    },

    async setFilters(status: string, type: string) {
      this.returns.status = status
      this.returns.type = type
      this.returns.pagination.page = 1
      await this.fetchReturns(true)
    },

    async approveReturn(returnId: number) {
      const res: any = await $fetch(`/api/dashboard/returns/${returnId}/approve`, {
        method: 'POST',
      })
      await this.fetchReturns(true)
      return res
    },

    async rejectReturn(returnId: number, reason: string) {
      const res: any = await $fetch(`/api/dashboard/returns/${returnId}/reject`, {
        method: 'POST',
        body: { reason },
      })
      await this.fetchReturns(true)
      return res
    },

    async markReceived(returnId: number, notes?: string) {
      const res: any = await $fetch(`/api/dashboard/returns/${returnId}/mark-received`, {
        method: 'POST',
        body: { notes },
      })
      await this.fetchReturns(true)
      return res
    },

    async processRefund(returnId: number, amount?: number, remarks?: string) {
      const res: any = await $fetch(`/api/refunds/${returnId}/process`, {
        method: 'POST',
        body: {
          refund_amount: amount,
          refund_remarks: remarks,
        },
      })
      await this.fetchReturns(true)
      return res
    },
  },
})