import { LoginData, AuthResponse, RefreshResponse } from '../types/auth';

const API_BASE = 'https://thedun.ru';

export const authAPI = {
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  refresh: async (token: string): Promise<RefreshResponse> => {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Refresh-Token': token },
    });
    return response.json();
  },
};