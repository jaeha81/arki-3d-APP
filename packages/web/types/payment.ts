export interface PaymentPrepareResponse {
  order_id: string
  order_name: string
  amount: number
  customer_key: string
  client_key: string
  success_url: string
  fail_url: string
}

export interface PaymentRecord {
  id: string
  order_id: string
  order_name: string
  amount: number
  status: 'pending' | 'done' | 'canceled' | 'failed'
  method: string | null
  receipt_url: string | null
  plan: string
  created_at: string
}
