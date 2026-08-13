import { get } from '../../../shared/api/client'
import type { Dashboard, SalesSummary, TopProductEntry } from '../../../shared/api/types'

export type Period = 'today' | 'week' | 'month'

export const reportApi = {
  summary: (period: Period) =>
    get<{ summary: SalesSummary }>(`/api/reports/summary?period=${period}`),
  topProducts: (period: Period, limit = 10) =>
    get<{ report: { period: Period; from: string; to: string; products: TopProductEntry[] } }>(
      `/api/reports/top-products?period=${period}&limit=${limit}`,
    ),
  dashboard: (topProductsLimit = 5) =>
    get<{ dashboard: Dashboard }>(`/api/reports/dashboard?topProductsLimit=${topProductsLimit}`),
}