interface SuccessResponse<T = any> {
  status: number
  message: string
  data: T
  success: boolean
}

type CartItem = {
  id: number
  user_id: string
  product_id: string
  quantity: number
  product: Product
  variants: Array
}
