import { create } from 'zustand';
import { api, clearToken, setToken } from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    setToken(data.token);
    set({ user: data.user, loading: false });
  },

  logout: () => {
    clearToken();
    set({ user: null, loading: false });
  },

  /** Called on app boot to restore the session from a stored token, if any. */
  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, loading: false });
    } catch {
      clearToken();
      set({ user: null, loading: false });
    }
  },
}));
