/* eslint-disable @typescript-eslint/no-empty-object-type */
import { productsActions } from './actions/productsActions'

export const useProductsStore = defineStore<'products', ProductsStateData, {}, ProductsActions>('products', {
  state: (): ProductsStateData => ({
    isLoading: false,
    featuredProducts: [] as Product[],
    wishlist: [] as Product[],
    cart: [] as CartItem[],
    unavailableCart: [],
    selectedCart: [],
    totalCartItems: 0,
    productsWishlist: {
      products: [] as Product[],
      pages: {} as Record<number, Product[]>,
      loading: false,
      meta: {
        total: 0,
        page: 1,
        perPage: 10,
        totalPages: 0,
      },
    },
    totalWishlistItems: 0,

    sectionProducts: [] as any[],
    products: {} as Section,
    variants: [],
  }),
  actions: productsActions,
})
