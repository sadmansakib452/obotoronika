type Section = {
  [key: string]: {
    id: number
    title: string
    slug: string
    description: string
    products: Product[]
    meta: {
      page: number
      perPage: number
      total: number
      totalPages: number
    }
  }
}

type ProductsState = ProductsStateData // Alias for ProductsStateData

// Existing ProductsStateData definition
interface ProductsStateData {
  fetchWishlist(): unknown
  isLoading: boolean
  featuredProducts: Product[]
  wishlist: Product[]
  cart: CartItem[]
  unavailableCart: CartItem[]
  selectedCart: CartItem[]
  totalCartItems: number
  productsWishlist: {
    products: Product[]
    pages: Record<number, Product[]>
    loading: boolean
    meta: {
      total: number
      page: number
      perPage: number
      totalPages: number
    }
  }
  totalWishlistItems: number
  sectionProducts: any[]
  products: Section
  variants: any[]
}

interface ProductsActions {
  removeCart: (product: string) => Promise<void>
  fetchFeaturedProducts: () => Promise<void>
  fetchWishlist: () => Promise<void>
  addWishlist: (product: Product) => Promise<void>
  removeWishlist: (product: Product) => Promise<void>
  addToCart: (productId: string, quantity: number) => Promise<void>
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  removeCartMany: (productIds: string[]) => Promise<void>
  fetchCart: () => Promise<void>
  fetchWishlistCount: () => Promise<void>
  fetchCartCount: () => Promise<void>
  fetchProductWishlist: (page: number) => Promise<void>
  fetchSectionProducts: () => Promise<void>
  fetchProducts: (slug: string, query: any) => Promise<void>
  addVariant: (variant) => void
}

type ProductsResponse = {
  data: Products[]
  meta: Meta
}
