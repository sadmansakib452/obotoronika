/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { useAuth } from '@/composables/useAuth'
import { useSettingsStore } from '@/stores/settings'

// Define actions
export const productsActions: ProductsActions = {
  async fetchFeaturedProducts(this: ProductsStateData) {
    this.isLoading = true
    try {
      const response = await fetch('/api/products/featured')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      this.featuredProducts = data?.data?.products || []
    }
    catch (error) {
      console.error('Error fetching featured products:', error)
    }
    finally {
      this.isLoading = false
    }
  },

  async fetchWishlist(this: ProductsState) {
    try {
      const { data }: any = await useFetch('/api/products/wishlist')
      this.wishlist = data.value?.data || []
    }
    catch (error) {
      console.log(error)
    }
  },

  async addWishlist(this: ProductsState, product: Product) {
    try {
      await $fetch('/api/products/wishlist', {
        method: 'POST',
        body: { product_id: product.id },
      })
      this.wishlist.push(product)
      this.totalWishlistItems = Math.max(0, this.totalWishlistItems + 1)
      // Invalidate productsWishlist cache so next visit to wishlist page fetches fresh data
      this.productsWishlist.pages = {}
    }
    catch {
      console.log()
    }
  },

  async removeWishlist(this: ProductsState, product: Product) {
    try {
      await $fetch('/api/products/wishlist', {
        method: 'DELETE',
        query: { product_id: product.id },
      })
      this.wishlist = this.wishlist.filter(
        (item: any) => item.product_id !== product.id,
      )
      this.totalWishlistItems = Math.max(0, this.totalWishlistItems - 1)
      // Keep productsWishlist in sync if we're on wishlist page
      if (this.productsWishlist.products.length) {
        this.productsWishlist.products = this.productsWishlist.products.filter(
          p => p.id !== product.id,
        )
        this.productsWishlist.meta.total = Math.max(
          0,
          (this.productsWishlist.meta.total ?? 0) - 1,
        )
        // Invalidate cached page so next visit refetches from server (prevents deleted item reappearing or empty list)
        const currentPage = this.productsWishlist.meta.page
        // @ts-ignore
        delete this.productsWishlist.pages[currentPage]
      }
      // Refetch wishlist so product card hearts stay in sync
      await this.fetchWishlist()
    }
    catch {
      console.log()
    }
  },

  async removeCart(this: ProductsStateData & ProductsActions, productID: string) {
    const settingsStore = useSettingsStore()
    settingsStore.setIsPageLoading(true)
    try {
      const { error } = await useFetch(`/api/products/cart/${productID}`, {
        method: 'DELETE',
      })

      if (error.value) {
        throw new Error('Failed to delete cart.')
      }

      await this.fetchCart()
    }
    catch (error) {
      console.error('Error updating cart quantity:', error)
      throw error
    }
    finally {
      settingsStore.setIsPageLoading(false)
    }
  },

  async fetchProductWishlist(this: ProductsState, page: number) {
    if (this.productsWishlist.pages[page]) {
      this.productsWishlist.products = this.productsWishlist.pages[page]
      this.productsWishlist.meta.page = page
      console.log('Cached Products:', this.productsWishlist.products)
      return
    }

    this.productsWishlist.loading = true
    try {
      interface WishlistProduct {
        id: string
        product: Product
      }

      interface WishlistResponse {
        data: {
          products: WishlistProduct[]
          meta: {
            total: number
            page: number
            perPage: number
            totalPages: number
          }
        }
      }

      // @ts-ignore
      const { data }: WishlistResponse = await $fetch(
        '/api/products/wishlist/products',
        {
          query: {
            page,
            perPage: this.productsWishlist.meta.perPage,
          },
        },
      )

      if (!data || !data.products) {
        throw new Error('Invalid response from the server')
      }

      this.productsWishlist.pages[page] = data.products.map(
        item => item.product,
      )
      this.productsWishlist.products = this.productsWishlist.pages[page]
      this.productsWishlist.meta = {
        ...this.productsWishlist.meta,
        ...data.meta,
      }
      // Keep navbar count in sync when wishlist page is loaded
      this.totalWishlistItems = this.productsWishlist.meta.total ?? 0
    }
    catch (error) {
      console.error('Error fetching product wishlist:', error)
    }
    finally {
      this.productsWishlist.loading = false
    }
  },

  async fetchSectionProducts(this: ProductsState) {
    if (!this.sectionProducts.length) {
      const { data }: any = await useFetch('/api/products/sections')
      const sections = data.value?.data?.sections ?? []
      this.sectionProducts = sections
    }
  },

  async fetchProducts(this: ProductsState, slug: string, query: any) {
    const { data }: any = await useFetch(`/api/products/sections/${slug}`, {
      method: 'GET',
      query,
    })
    const section = data.value?.data

    if (!this.products[slug]) {
      this.products[slug] = section
    }
    else {
      this.products[slug].products = [
        ...this.products[slug].products,
        ...section.products,
      ]
      this.products[slug].meta = section.meta
    }
  },

  async fetchCart(this: ProductsState) {
    try {
      const { data, error }: any = await useFetch('/api/products/cart', {
        method: 'GET',
      })

      if (error.value) {
        // Unauthenticated or other error: show empty cart so page isn't stale
        this.cart = []
        this.unavailableCart = []
        this.totalCartItems = 0
        throw new Error('Failed to fetch cart items')
      }

      this.cart = data?.value?.data?.products || []
      this.unavailableCart = data?.value?.data?.unavailable || []
      // Keep navbar count in sync with full cart data
      const total = [...this.cart, ...this.unavailableCart].reduce(
        (sum, i) => sum + (i?.quantity ?? 1),
        0,
      )
      this.totalCartItems = total
    }
    catch (error) {
      console.error('Error fetching cart:', error)
      throw error
    }
  },

  async addToCart(
    this: ProductsStateData & ProductsActions,
    productId: string,
    quantity: number,
  ): Promise<void> {
    try {
      const { status } = await $fetch('/api/products/cart', {
        method: 'POST',
        body: { product_id: productId, quantity, variants: this.variants },
      })

      // API returns 201 for new item, 200 when updating existing item quantity
      if (status !== 201 && status !== 200) {
        throw new Error('Failed to add product to cart')
      }

      await this.fetchCart()
    }
    catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  },

  async updateCartQuantity(
    this: ProductsStateData & ProductsActions,
    productId: string,
    quantity: number,
  ) {
    const settingsStore = useSettingsStore()
    settingsStore.setIsPageLoading(true)
    try {
      const { error } = await useFetch(`/api/products/cart/${productId}`, {
        method: 'PATCH',
        body: { quantity },
      })

      if (error.value) {
        throw new Error('Failed to update cart quantity')
      }

      await this.fetchCart()
    }
    catch (error) {
      console.error('Error updating cart quantity:', error)
      throw error
    }
    finally {
      settingsStore.setIsPageLoading(false)
    }
  },

  async removeFromCart(
    this: ProductsStateData & ProductsActions,
    productId: string,
  ) {
    try {
      const { error } = await useFetch(`/api/products/cart/${productId}`, {
        method: 'DELETE',
      })

      if (error.value) {
        throw new Error('Failed to remove product from cart')
      }

      await this.fetchCart() // Now TypeScript recognizes fetchCart
    }
    catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    }
  },

  async removeCartMany(
    this: ProductsStateData & ProductsActions,
    productIds: string[],
  ) {
    if (productIds.length === 0) return
    const settingsStore = useSettingsStore()
    settingsStore.setIsPageLoading(true)
    try {
      await $fetch('/api/products/cart/delete-many', {
        method: 'POST',
        body: { product_ids: productIds },
      })
      await this.fetchCart()
    }
    catch (error) {
      console.error('Error removing products from cart:', error)
      throw error
    }
    finally {
      settingsStore.setIsPageLoading(false)
    }
  },

  async fetchWishlistCount(this: ProductsState) {
    try {
      const data: any = await $fetch('/api/products/wishlist/count', {
        method: 'GET',
      })
      this.totalWishlistItems = data.data.total
    }
    catch (error) {
      console.error('Error fetching wishlist count:', error)
      this.totalWishlistItems = 0
      throw error
    }
  },

  async fetchCartCount(this: ProductsState) {
    try {
      const data: any = await $fetch('/api/products/cart/count', {
        method: 'GET',
      })
      this.totalCartItems = data.data.total
    }
    catch (error) {
      console.error('Error fetching cart count:', error)
      this.totalCartItems = 0
      throw error
    }
  },
  addVariant(this: ProductsState, variant) {
    if (!variant || !Object.keys(variant).length) return acc
    const type = Object.keys(variant)[0]
    // Remove any existing variant of this type
    // @ts-ignore
    this.variants = this.variants.filter(v => !Object.prototype.hasOwnProperty.call(v, type))
    // Add the new variant
    this.variants.push(variant)
  },
}
