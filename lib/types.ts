export type OrderStatus = 'pendente' | 'confirmado' | 'cancelado'

export interface Profile {
  id: string
  company_name: string | null
  whatsapp_business_number: string | null
  plan_status: string | null
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: number
  user_id: string
  name: string
  price: number
  sku: string | null
  category: string | null
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: number
  user_id: string
  client_name: string
  items: OrderItem[]
  total_value: number
  status: OrderStatus
  created_at?: string
  updated_at?: string
}
