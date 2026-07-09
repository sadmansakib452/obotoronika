type OrderItem = {
  id: number
  price: number
  product: {
    title: string
    thumbnail: string
  }
  order_id: number
  quantity: number
}

type Order = {
  id: number
  user_id: string
  status: 'pending' | 'completed' | 'cancelled' | string
  total_amount: number
  shipping_address: string
  created_at: string
  order_id: string
  user?: {
    name: string
    email: string
    phone: string
  }
  items?: OrderItem[]
}

type OrdersResponse = {
  orders: Order[]
  meta: Meta
}
