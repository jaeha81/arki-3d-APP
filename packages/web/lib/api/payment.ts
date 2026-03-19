import { apiClient } from './client'
import type { PaymentPrepareResponse, PaymentRecord } from '@/types/payment'

export const paymentApi = {
  prepare: async (plan: string): Promise<PaymentPrepareResponse> => {
    return apiClient.post<PaymentPrepareResponse>('/payments/prepare', { plan })
  },

  confirm: async (paymentKey: string, orderId: string, amount: number): Promise<PaymentRecord> => {
    return apiClient.post<PaymentRecord>('/payments/confirm', {
      payment_key: paymentKey,
      order_id: orderId,
      amount,
    })
  },

  getHistory: async (): Promise<PaymentRecord[]> => {
    return apiClient.get<PaymentRecord[]>('/payments/history')
  },
}
