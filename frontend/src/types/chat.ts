export interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  data?: any
}

export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  discount?: string
  image: string
  description: string
  purchaseUrl: string
  platform?: string
}

export interface ChatResponse {
  type: 'text' | 'product_recommendation' | 'price_comparison'
  message: string
  products?: Product[]
}

