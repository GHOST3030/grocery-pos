import { get, post } from '../../../shared/api/client'
import type { User } from '../../../shared/api/types'

export const authApi = {
  login: (username: string, password: string) =>
    post<{ token: string; user: User }>('/api/auth/login', { username, password }),
  me: () => get<{ user: User }>('/api/auth/me'),
}