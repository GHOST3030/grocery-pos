import { del, get, post, put } from '../../../shared/api/client'
import type { Product } from '../../../shared/api/types'

export const productApi = {
  list: (params: { search?: string; categoryId?: string; activeOnly?: boolean } = {}) => {
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    if (params.categoryId) q.set('categoryId', params.categoryId)
    if (params.activeOnly !== undefined) q.set('activeOnly', String(params.activeOnly))
    const qs = q.toString()
    return get<{ products: Product[] }>(`/api/products${qs ? `?${qs}` : ''}`)
  },
  bySku: (sku: string) => get<{ product: Product }>(`/api/products/sku/${encodeURIComponent(sku)}`),
  byId: (id: string) => get<{ product: Product }>(`/api/products/${id}`),
  create: (body: Partial<Product>) => post<{ product: Product }>('/api/products', body),
  update: (id: string, body: Partial<Product>) =>
    put<{ product: Product }>(`/api/products/${id}`, body),
  remove: (id: string) => del<void>(`/api/products/${id}`),
}