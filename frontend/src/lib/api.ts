import axios from 'axios';
import type { ApiErrorBody } from '../types';

// VITE_API_URL is set differently per deployment (.env.local vs .env.cloud),
// mirroring the backend's dual-mode config — never hardcode localhost here.
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export const api = axios.create({ baseURL });

const TOKEN_KEY = 'pos_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Extracts a friendly message from our backend's { error: { message } } shape. */
export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    if (body?.error?.message) return body.error.message;
    if (err.message) return err.message;
  }
  return 'Something went wrong';
}
