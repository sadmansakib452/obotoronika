type Variant = {
  name: string
  description: string
  value_count: number
  created_at: string
  updated_at: string
}

type Option = {
  id: number
  name: string
  field_type: string
  values: {
    id: number
    label: string
    value: string
    variant_id: number
  }
}

type ProductOptions = {
  id: number
  label: string
  value: string | number
}

type ProductVariant = {
  id: number
  name: string
  key: string
  filed_type: string
  values: ProductOptions
}

export const useVariantStore = defineStore('variants', {
  state: () => ({
    variants: {
      isLoading: false,
      data: [] as Variant[],
    },
    options: {
      isLoading: false,
      data: {} as Option,
    },
    product_variants: {
      variants: [] as ProductVariant[],
      selected_variant: {} as ProductVariant,
      options: {} as ProductOptions,
    } as any,
  }),
  actions: {
    async getVariants() {
      try {
        this.variants.isLoading = true
        const response = await fetch('/api/dashboard/variants')
        const { data } = await response.json()
        this.variants.data = data
      }
      catch {
        this.variants.isLoading = false
      }
      finally {
        this.variants.isLoading = false
      }
    },
    async getOptions(id: number | string) {
      try {
        this.options.isLoading = true
        const response = await fetch('/api/dashboard/variants/' + id)
        const { data } = await response.json()
        this.options.data = data
      }
      catch {
        this.options.isLoading = false
      }
      finally {
        this.options.isLoading = false
      }
    },
    async getProductVariants() {
      try {
        this.options.isLoading = true
        const response = await fetch('/api/dashboard/variants/product-variants')
        const { data } = await response.json()
        this.product_variants.variants = data

        // Fetch options for each variant and store them
        for (const variant of data) {
          const res = await fetch(`/api/dashboard/variants/${variant.id}`)
          const { data: optionData }: any = await res.json()
          this.product_variants.options[variant.key] = optionData.values
        }
      }
      catch (error) {
        console.error('Error fetching product variants/options:', error)
      }
      finally {
        this.options.isLoading = false
      }
    },

  },
})
