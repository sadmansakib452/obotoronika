type Fields = {
  name: string
  value: string
}

export interface FormType {
  title: string | undefined
  sku: string | undefined
  category_id: number | undefined
  description: string | undefined
  thumbnail: any | undefined
  files: any[]
  track_inventory: boolean
  price: number | undefined
  cost_price: number | undefined
  offer_price: number | undefined
  current_stock: number | undefined
  low_stock_alert: number | undefined
  initial_stock: number | undefined
  availability: string
  global_trade_number: string | undefined
  manufacturer_number: string | undefined
  brand: string | undefined
  item_upc: string | undefined
  custom_fields: Fields[]
  free_shipping: boolean
  shipping_price: number | undefined
  locationBasedShipping: boolean
  locationBasedShippingPrice: Fields[]
  availableDate: string | undefined
  endDate: string | undefined
  variants: []
  tags: string[]
  page_title: string | undefined
  meta_keywords: string[]
  meta_description: string | undefined
  slug: string | undefined
  product_visibility: string | undefined
}
