import { del, get, post, put } from '../../../shared/api/client'
import type { Category } from '../../../shared/api/types'

export const categoryApi = {
  list: () => get<{ categories: Category[] }>('/api/categories'),
  create: (name: string) => post<{ category: Category }>('/api/categories', { name }),
  update: (id: string, name: string) => put<{ category: Category }>(`/api/categories/${id}`, { name }),
  remove: (id: string) => del<void>(`/api/categories/${id}`),
}