export const useFinanceStore = defineStore('finance', {
  state: () => ({
    invoices: {
      isLoading: false,
      data: [] as any[],
      pagination: {
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
      },
    },
    transactions: {
      isLoading: false,
      data: {} as Record<string, any[]>,
      search: '',
      pagination: {
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
      },
    },
    refunds: {
      isLoading: false,
      data: {} as Record<string, any[]>,
      search: '',
      statusFilter: null as string | null,
      typeFilter: null as string | null,
      pagination: {
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
      },
      details: null as any | null,
    },
    cancellations: {
      isLoading: false,
      data: {} as Record<string, any[]>,
      search: '',
      statusFilter: null as string | null,
      pagination: {
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
      },
    },
  }),

  actions: {
    // 📦 Invoice logic (no caching here)
    async fetchInvoices() {
      const { page, perPage } = this.invoices.pagination
      this.invoices.isLoading = true
      try {
        const res: any = await $fetch('/api/dashboard/finance/invoices', {
          query: { page, perPage },
        })
        const data = res.data
        this.invoices.data = data.data
        this.invoices.pagination.total = data.pagination.total
        this.invoices.pagination.page = data.pagination.page
        this.invoices.pagination.totalPages = data.pagination.totalPages
      }
      catch (err: any) {
        this.invoices.data = []
        const toast = useToast()
        toast.add({ title: 'Invoices', description: err?.data?.message || 'Failed to load invoices', color: 'red' })
      }
      finally {
        this.invoices.isLoading = false
      }
    },

    async setInvoicesPagination(page: number, perPage: number) {
      this.invoices.pagination.page = page
      this.invoices.pagination.perPage = perPage
      await this.fetchInvoices()
    },

    getTransactionPageKey(page: number, perPage: number, search = '') {
      return `${page}:${perPage}:${search.trim().toLowerCase()}`
    },

    async fetchTransactions() {
      const { page, perPage } = this.transactions.pagination
      const searchQuery = this.transactions.search.trim()
      const pageKey = this.getTransactionPageKey(page, perPage, searchQuery)

      this.transactions.isLoading = true

      if (this.transactions.data[pageKey]) {
        this.transactions.isLoading = false
        return
      }

      try {
        const res = await fetch(
          `/api/dashboard/finance/transactions?page=${page}&perPage=${perPage}&q=${encodeURIComponent(searchQuery)}`,
        )
        const { data } = await res.json()

        this.transactions.data[pageKey] = data?.data ?? []
        this.transactions.pagination.total = data.meta.total
        this.transactions.pagination.totalPages = data.meta.totalPages
      }
      catch (e) {
        console.error('Failed to fetch transactions:', e)
      }
      finally {
        this.transactions.isLoading = false
      }
    },
    async setTransactionsPagination(page: number, perPage: number, forceReset = false) {
      if (forceReset) {
        this.transactions.pagination.page = 1
      }
      else {
        this.transactions.pagination.page = page
      }
      this.transactions.pagination.perPage = perPage
      await this.fetchTransactions()
    },

    // ==================== REFUNDS ====================

    /**
     * Generate cache key for refunds data
     */
    getRefundPageKey(page: number, perPage: number, search = '', status = '', type = '') {
      return `${page}:${perPage}:${search.trim().toLowerCase()}:${status || 'all'}:${type || 'all'}`
    },

    /**
     * Fetch paginated refunds list
     */
    async fetchRefunds(force = false) {
      const { page, perPage } = this.refunds.pagination
      const searchQuery = this.refunds.search.trim()
      const statusFilter = this.refunds.statusFilter
      const typeFilter = this.refunds.typeFilter
      const pageKey = this.getRefundPageKey(page, perPage, searchQuery, statusFilter || '', typeFilter || '')

      this.refunds.isLoading = true

      // Use cache if data exists and not forcing refresh
      if (!force && this.refunds.data[pageKey]) {
        this.refunds.isLoading = false
        return
      }

      try {
        const params = new URLSearchParams({
          page: String(page),
          perPage: String(perPage),
        })

        if (searchQuery) {
          params.set('q', searchQuery)
        }

        if (statusFilter) {
          params.set('status', statusFilter)
        }

        if (typeFilter) {
          params.set('type', typeFilter)
        }

        const response = await fetch(`/api/dashboard/finance/refunds?${params.toString()}`)
        const result = await response.json()

        if (result.success) {
          this.refunds.data[pageKey] = result.data.data
          this.refunds.pagination.total = result.data.meta.total
          this.refunds.pagination.totalPages = result.data.meta.totalPages
        }
        else {
          console.error('[finance store] Failed to fetch refunds:', result.message)
        }
      }
      catch (error) {
        console.error('[finance store] Error fetching refunds:', error)
      }
      finally {
        this.refunds.isLoading = false
      }
    },

    /**
     * Set pagination and optionally reset to page 1
     */
    async setRefundsPagination(page: number, perPage: number, forceReset = false) {
      if (forceReset) {
        this.refunds.pagination.page = 1
      }
      else {
        this.refunds.pagination.page = page
      }
      this.refunds.pagination.perPage = perPage
      await this.fetchRefunds(true)
    },

    /**
     * Set search query and refresh data
     */
    async setRefundsSearch(search: string) {
      this.refunds.search = search
      this.refunds.pagination.page = 1
      await this.fetchRefunds(true)
    },

    /**
     * Set status filter and refresh data
     */
    async setRefundsStatusFilter(status: string | null) {
      this.refunds.statusFilter = status
      this.refunds.pagination.page = 1
      await this.fetchRefunds(true)
    },

    /**
     * Fetch single refund details
     */
    async fetchRefundDetails(refundId: number) {
      this.refunds.isLoading = true
      this.refunds.details = null

      try {
        const response = await fetch(`/api/dashboard/finance/refunds/${refundId}`)
        const result = await response.json()

        if (result.success) {
          this.refunds.details = result.data?.data || result.data
        }
        else {
          console.error('[finance store] Failed to fetch refund details:', result.message)
        }
      }
      catch (error) {
        console.error('[finance store] Error fetching refund details:', error)
      }
      finally {
        this.refunds.isLoading = false
      }
    },

    /**
     * Update refund status (approve or reject)
     */
    async updateRefundStatus(refundId: number, status: 'approved' | 'rejected', adminNote?: string) {
      try {
        const response = await fetch(`/api/dashboard/finance/refunds/${refundId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            admin_note: adminNote || null,
          }),
        })

        const result = await response.json()

        if (result.success) {
          // Clear cache to refresh the list
          this.refunds.data = {}
          return { success: true, data: result.data }
        }
        else {
          console.error('[finance store] Failed to update refund:', result.message)
          return { success: false, message: result.message }
        }
      }
      catch (error) {
        console.error('[finance store] Error updating refund status:', error)
        return { success: false, message: 'Failed to update refund status' }
      }
    },

    /**
     * Clear refund details
     */
    clearRefundDetails() {
      this.refunds.details = null
    },

    // ==================== CANCELLATIONS ====================

    /**
     * Generate cache key for cancellations data
     */
    getCancellationPageKey(page: number, perPage: number, search = '', status = '') {
      return `${page}:${perPage}:${search.trim().toLowerCase()}:${status || 'all'}`
    },

    /**
     * Fetch paginated cancellations list
     */
    async fetchCancellations(force = false) {
      const { page, perPage } = this.cancellations.pagination
      const searchQuery = this.cancellations.search.trim()
      const statusFilter = this.cancellations.statusFilter
      const pageKey = this.getCancellationPageKey(page, perPage, searchQuery, statusFilter || '')

      this.cancellations.isLoading = true

      if (!force && this.cancellations.data[pageKey]) {
        this.cancellations.isLoading = false
        return
      }

      try {
        const params = new URLSearchParams({
          page: String(page),
          perPage: String(perPage),
        })

        if (searchQuery) {
          params.set('q', searchQuery)
        }

        if (statusFilter) {
          params.set('status', statusFilter)
        }

        const response = await fetch(`/api/dashboard/finance/cancellations?${params.toString()}`)
        const result = await response.json()

        if (result.success) {
          this.cancellations.data[pageKey] = result.data.data
          this.cancellations.pagination.total = result.data.meta.total
          this.cancellations.pagination.totalPages = result.data.meta.totalPages
        }
        else {
          console.error('[finance store] Failed to fetch cancellations:', result.message)
        }
      }
      catch (error) {
        console.error('[finance store] Error fetching cancellations:', error)
      }
      finally {
        this.cancellations.isLoading = false
      }
    },

    /**
     * Set pagination and optionally reset to page 1
     */
    async setCancellationsPagination(page: number, perPage: number, forceReset = false) {
      if (forceReset) {
        this.cancellations.pagination.page = 1
      }
      else {
        this.cancellations.pagination.page = page
      }
      this.cancellations.pagination.perPage = perPage
      await this.fetchCancellations(true)
    },

    /**
     * Approve a cancellation request
     */
    async approveCancellation(cancellationId: number) {
      try {
        const response = await fetch(`/api/dashboard/finance/cancellations/${cancellationId}/approve`, {
          method: 'PATCH',
        })

        const result = await response.json()

        if (result.success) {
          this.cancellations.data = {}
          return { success: true, data: result.data }
        }
        else {
          console.error('[finance store] Failed to approve cancellation:', result.message)
          return { success: false, message: result.message }
        }
      }
      catch (error) {
        console.error('[finance store] Error approving cancellation:', error)
        return { success: false, message: 'Failed to approve cancellation' }
      }
    },

    /**
     * Reject a cancellation request
     */
    async rejectCancellation(cancellationId: number, adminNote?: string) {
      try {
        const response = await fetch(`/api/dashboard/finance/cancellations/${cancellationId}/reject`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admin_note: adminNote || null,
          }),
        })

        const result = await response.json()

        if (result.success) {
          this.cancellations.data = {}
          return { success: true, data: result.data }
        }
        else {
          console.error('[finance store] Failed to reject cancellation:', result.message)
          return { success: false, message: result.message }
        }
      }
      catch (error) {
        console.error('[finance store] Error rejecting cancellation:', error)
        return { success: false, message: 'Failed to reject cancellation' }
      }
    },

  },
})
