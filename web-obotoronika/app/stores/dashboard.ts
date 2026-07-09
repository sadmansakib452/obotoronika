export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    orders: {
      orders: [],
      meta: {
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
      },
    } as OrdersResponse,
    products: {
      isLoading: false,
      data: [],
      meta: {
        totalProducts: 0,
        currentPage: 1,
        perPage: 10,
      },
      filter: {
        searchQuery: '',
        filterBy: {} as Record<string, any>, // Updated to be an object
        sortBy: 'created_at',
        sortOrder: 'desc',
      },
    },
    categories: {
      isLoading: false,
      data: [],
      meta: {
        total: 0,
        page: 1,
        perPage: 10,
      },
    },
  }),
  actions: {
    async fetchDashboardOrders() {
      const { data, error }: any = await useFetch('/api/dashboard/orders', { query: { page: this.orders.meta.page, perPage: this.orders.meta.perPage } })
      if (error.value) {
        const store = useSettingsStore()
        store.isError = true
        store.errorMessage = error.value.message
        return
      }
      const orders = data.value?.data as OrdersResponse
      this.orders = orders
    },
    setOrderPagination(page: number, perPage: number) {
      this.orders.meta.page = page
      this.orders.meta.perPage = perPage
      this.fetchDashboardOrders() // Trigger fetch after updating pagination
    },
    async fetchProducts() {
      this.products.isLoading = true
      const { data, error }: any = await useFetch(`/api/dashboard/products`, {
        query: {
          page: this.products.meta.currentPage,
          perPage: this.products.meta.perPage,
          q: this.products.filter.searchQuery,
          sort: this.products.filter.sortBy,
          order: this.products.filter.sortOrder,
          filterBy: this.products.filter.filterBy,
        },
      })
      if (error.value) {
        const store = useSettingsStore()
        store.isError = true
        store.errorMessage = error.value.message
        return
      }

      const response = data.value?.data
      this.products.data = response.products ?? []
      console.log(response.meta.total)
      this.products.meta.totalProducts = response.meta.total ?? 0
      this.products.isLoading = false
    },
    setProductsPagination(page: number, perPage: number) {
      this.products.meta.currentPage = page
      this.products.meta.perPage = perPage
      this.fetchProducts() // Trigger fetch after updating pagination
    },
    setProductsSearchQuery(query: string) {
      this.products.filter.searchQuery = query
      this.fetchProducts() // Trigger fetch after updating search query
    },
    setProductsFilter(key: string, value: any) {
      this.setProductsPagination(1, 10)
      if (typeof this.products.filter.filterBy !== 'object') {
        this.products.filter.filterBy = {} // Reset to an empty object if it's not an object
      }
      this.products.filter.filterBy[key] = value // Update the filter object dynamically
      console.log('Updated filterBy:', this.products.filter.filterBy)
      this.fetchProducts() // Trigger fetch after updating filter
    },
    setProductsSorting(sortBy: string, sortOrder: string) {
      this.products.filter.sortBy = sortBy
      this.products.filter.sortOrder = sortOrder
      this.fetchProducts() // Trigger fetch after updating sorting
    },
    resetProductsFilter() {
      this.products.filter.filterBy = {}
      this.products.filter.searchQuery = ''
      this.products.filter.sortBy = 'created_at'
      this.products.filter.sortOrder = 'desc'
      this.fetchProducts()
    },
    // All the methods for now categories
    async fetchCategories(refresh = false) {
      if (this.categories.data.length && !refresh) return
      this.categories.isLoading = true
      const { data } = await useFetch('/api/dashboard/categories', {
        method: 'get',
        query: {
          page: this.categories.meta.page,
          perPage: this.categories.meta.perPage,
        },
        default: () => ({
          status: 200,
          message: 'OK',
          data: { categories: [], meta: { total: 0, page: 1, perPage: 10, totalPages: 0 } },
        }),
      })
      const fetchedData = data.value as unknown as SuccessResponse
      this.categories.data = fetchedData.data.categories
      if (fetchedData.data.meta) {
        this.categories.meta.total = fetchedData.data.meta.total
        this.categories.meta.page = fetchedData.data.meta.page
        this.categories.meta.perPage = fetchedData.data.meta.perPage
      }
      this.categories.isLoading = false
    },
    setCategoriesPagination(page: number, perPage: number) {
      this.categories.meta.page = page
      this.categories.meta.perPage = perPage
      this.fetchCategories(true) // Trigger fetch after updating pagination
    },
  },
})
