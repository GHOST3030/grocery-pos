import { del, get, post, put } from '../../../shared/api/client'
import type { Supplier } from '../../../shared/api/types'

export const supplierApi = {
  list: () => get<{ suppliers: Supplier[] }>('/api/suppliers'),
  create: (body: Partial<Supplier>) => post<{ supplier: Supplier }>('/api/suppliers', body),
  update: (id: string, body: Partial<Supplier>) =>
    put<{ supplier: Supplier }>(`/api/suppliers/${id}`, body),
  remove: (id: string) => del<void>(`/api/suppliers/${id}`),
}