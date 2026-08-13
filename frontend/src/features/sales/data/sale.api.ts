import { del, get, post } from '../../../shared/api/client'
import type { PaymentMethod, Sale } from '../../../shared/api/types'

export interface CheckoutPayload {
  items: { productId: string; qty: number }[]
  discount?: number
  taxRate?: number
  paymentMethod: PaymentMethod
  amountPaid: number
}

export const saleApi = {
  checkout: (body: CheckoutPayload) => post<{ sale: Sale }>('/api/sales/checkout', body),
  list: (from?: string, to?: string) => {
    const q = new URLSearchParams()
    if (from) q.set('from', from)
    if (to) q.set('to', to)
    const qs = q.toString()
    return get<{ sales: Sale[] }>(`/api/sales${qs ? `?${qs}` : ''}`)
  },
  byId: (id: string) => get<{ sale: Sale }>(`/api/sales/${id}`),
  byReceipt: (receiptNo: string) =>
    get<{ sale: Sale }>(`/api/sales/receipt/${encodeURIComponent(receiptNo)}`),
  void: (id: string) => del<void>(`/api/sales/${id}/void`),
  print: (id: string) => post<{ printed: true }>(`/api/sales/${id}/print`),
}