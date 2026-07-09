type Review = {
  id: number
  product_id: string
  order_id: number
  status: string
  title: string
  thumbnail: string
  price: number
}

export const useReviewStore = defineStore('reviews', {
  state: () => ({
    to_reviews: {
      isLoading: false,
      data: [] as Review[],
      pagination: {
        total: 0,
        per_page: 10,
        current_page: 1,
      },
    },
    reviews: {
      isLoading: false,
      data: [] as Review[],
      pagination: {
        total: 0,
        per_page: 0,
        page: 1,
      },
    },
  }),
  actions: {
    async getToReviews() {
      this.to_reviews.isLoading = true
      try {
        const response = await fetch(
          `/api/reviews/to-reviews?perPage=${this.to_reviews.pagination.per_page}&page=${this.to_reviews.pagination.current_page}`,
        )
        const { data } = await response.json()
        this.to_reviews.data = data.data
        this.to_reviews.pagination.current_page = data.meta.page
        this.to_reviews.pagination.total = data.meta.total
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.to_reviews.isLoading = false
      }
    },
    setPagination(page: number, perPage: number) {
      this.to_reviews.pagination.current_page = page
      this.to_reviews.pagination.per_page = perPage
      this.getToReviews()
    },
    async getReviews() {
      this.reviews.isLoading = true
      try {
        const response = await fetch(
          `/api/reviews?perPage=${this.to_reviews.pagination.per_page}&page=${this.to_reviews.pagination.current_page}`,
        )
        const { data } = await response.json()
        this.reviews.data = data
        // this.to_reviews.pagination.current_page = data.meta.page
        // this.to_reviews.pagination.total = data.meta.total
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.reviews.isLoading = false
      }
    },
  },
})
