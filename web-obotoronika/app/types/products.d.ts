type Image = {
  url: string
}

type VariantOption = {
  [key: string]: string[]
}

interface Product {
  id: string
  title: string
  name: string
  thumbnail: string
  shortDesc: string
  price: number
  offer_price: number | null
  rating: number
  description: string
  tags?: string[]
  files?: string[]
  variants: string
  slug: string
  quantity?: number
  variants?: []
  merchant_id: number | string
}
