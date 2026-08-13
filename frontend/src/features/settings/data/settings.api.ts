import { get, put } from '../../../shared/api/client'
import type { Settings } from '../../../shared/api/types'

export const settingsApi = {
  get: () => get<{ settings: Settings }>('/api/settings'),
  update: (settings: Settings) => put<{ settings: Settings }>('/api/settings', settings),
}