import { apiClient } from './client'
import type { PaymentPrepareResponse, PaymentRecord } from '@/types/payment'

export const paymentApi = {
  prepare: async (plan: string): Promise<PaymentPrepareResponse> => {
    const res = await apiClient.post<PaymentPrepareResponse>('/payments/prepare', { plan })
    return res.data
  },

  confirm: async (paymentKey: string, orderId: string, amount: number): Promise<PaymentRecord> => {
    const res = await apiClient.post<PaymentRecord>('/payments/confirm', {
      payment_key: paymentKey,
      order_id: orderId,
      amount,
    })
    return res.data
  },

  getHistory: async (): Promise<PaymentRecord[]> => {
    const res = await apiClient.get<PaymentRecord[]>('/payments/history')
    return res.data
  },
}
