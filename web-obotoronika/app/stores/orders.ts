type Order = {
  order_id: string
  status: string
  total_amount: number
  payment_method: string | null
  created_at: string
  first_product: {
    title: string
    thumbnail: string
    quantity: number
    price: number
  } | null
  more_products_count: number
}

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orders: {
      isLoading: false,
      data: [] as Order[],
      pagination: {
        page: 1,
        perPage: 6,
        total: 0,
      },
      counts: {
        all: 0,
        processing: 0,
        delivered: 0,
      },
    },
    processing: {
      isLoading: false,
      data: [] as Order[],
      pagination: {
        page: 1,
        perPage: 6,
        total: 0,
      },
    },
    shipped: {
      isLoading: false,
      data: [] as Order[],
      pagination: {
        page: 1,
        perPage: 6,
        total: 0,
      },
    },
    delivered: {
      isLoading: false,
      data: [] as Order[],
      pagination: {
        page: 1,
        perPage: 6,
        total: 0,
      },
    },
    cancelled: {
      isLoading: false,
      data: [] as Order[],
      pagination: {
        page: 1,
        perPage: 6,
        total: 0,
      },
    },
    returned: {
      isLoading: false,
      data: [] as Order[],
      pagination: {
        page: 1,
        perPage: 6,
        total: 0,
      },
    },
  }),
  actions: {
    async getOrdersCount() {
      try {
        const response = await fetch('/api/orders/counts')
        const { data } = await response.json()
        this.orders.counts.processing = data.counts.processing
        this.orders.counts.delivered = data.counts.delivered
      }
      catch (err) {
        console.error('[ORDERS-STORE] getOrdersCount failed:', err)
      }
    },
    async getOrders() {
      this.orders.isLoading = true
      try {
        const response = await fetch(`/api/orders?perPage=${this.orders.pagination.perPage}&page=${this.orders.pagination.page}`)
        const { data } = await response.json()
        this.orders.data = data.orders
        this.orders.pagination.page = data.meta.page
        this.orders.pagination.perPage = data.meta.perPage
        this.orders.pagination.total = data.meta.total
        this.orders.counts.all = data.meta.total
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.orders.isLoading = false
      }
    },
    setPagination(page: number, perPage: number) {
      this.orders.pagination.page = page
      this.orders.pagination.perPage = perPage
      this.getOrders()
    },
    async getProcessingOrders() {
      this.processing.isLoading = true
      try {
        const response = await fetch(`/api/orders/processing?perPage=${this.processing.pagination.perPage}&page=${this.processing.pagination.page}`)
        const { data } = await response.json()
        this.processing.data = data.orders
        this.processing.pagination.page = data.meta.page
        this.processing.pagination.perPage = data.meta.perPage
        this.processing.pagination.total = data.meta.total
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.processing.isLoading = false
      }
    },
    async getShippedOrders() {
      this.shipped.isLoading = true
      try {
        const response = await fetch(`/api/orders/shipped?perPage=${this.shipped.pagination.perPage}&page=${this.shipped.pagination.page}`)
        const { data } = await response.json()
        this.shipped.data = data.orders
        this.shipped.pagination.page = data.meta.page
        this.shipped.pagination.perPage = data.meta.perPage
        this.shipped.pagination.total = data.meta.total
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.shipped.isLoading = false
      }
    },
    setProcessingPagination(page: number, perPage: number) {
      this.processing.pagination.page = page
      this.processing.pagination.perPage = perPage
      this.getProcessingOrders()
    },
    setShippedPagination(page: number, perPage: number) {
      this.shipped.pagination.page = page
      this.shipped.pagination.perPage = perPage
      this.getShippedOrders()
    },
    async getDeliveredOrders() {
      this.delivered.isLoading = true
      try {
        const response = await fetch(`/api/orders/delivered?perPage=${this.delivered.pagination.perPage}&page=${this.delivered.pagination.page}`)
        const { data } = await response.json()
        this.delivered.data = data.orders
        this.delivered.pagination.page = data.meta.page
        this.delivered.pagination.perPage = data.meta.perPage
        this.delivered.pagination.total = data.meta.total
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.delivered.isLoading = false
      }
    },
    setDeliveredPagination(page: number, perPage: number) {
      this.delivered.pagination.page = page
      this.delivered.pagination.perPage = perPage
      this.getDeliveredOrders()
    },
    async getCancelledOrders() {
      this.cancelled.isLoading = true
      try {
        const response = await fetch(`/api/orders/cancelled?perPage=${this.cancelled.pagination.perPage}&page=${this.cancelled.pagination.page}`)
        const { data } = await response.json()
        this.cancelled.data = data.orders
        this.cancelled.pagination.page = data.meta.page
        this.cancelled.pagination.perPage = data.meta.perPage
        this.cancelled.pagination.total = data.meta.total
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.cancelled.isLoading = false
      }
    },
    setCancelledPagination(page: number, perPage: number) {
      this.cancelled.pagination.page = page
      this.cancelled.pagination.perPage = perPage
      this.getCancelledOrders()
    },
    async getReturnedOrders() {
      this.returned.isLoading = true
      try {
        const response = await fetch(`/api/orders/returned?perPage=${this.returned.pagination.perPage}&page=${this.returned.pagination.page}`)
        const { data } = await response.json()
        this.returned.data = data.orders
        this.returned.pagination.page = data.meta.page
        this.returned.pagination.perPage = data.meta.perPage
        this.returned.pagination.total = data.meta.total
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.returned.isLoading = false
      }
    },
    setReturnedPagination(page: number, perPage: number) {
      this.returned.pagination.page = page
      this.returned.pagination.perPage = perPage
      this.getReturnedOrders()
    },
  },
})
