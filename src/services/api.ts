import { LoginData, AuthResponse, RefreshResponse } from '../types/auth';
import { Group, GroupsResponse } from '../types/group';
import { storage } from '../utils/storage';

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

export const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = storage.getAccessToken();
  
  // Добавляем токен в заголовки, если он есть
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken ? { 'Authorization': accessToken } : {}),
  };
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  return response;
};

// Отдельная функция для обработки обновления токена
export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const refreshData = await authAPI.refresh(refreshToken);
    storage.setAccessToken(refreshData.accessToken);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    storage.clearTokens();
    return false;
  }
};

export const groupAPI = {
  getGroups: async (): Promise<Group[]> => {
    const response = await makeAuthenticatedRequest('/api/groups');
    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }
    const data: GroupsResponse = await response.json();
    return data.groups;
  },

  getGroup: async (groupId: number): Promise<Group> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch group');
    }
    return response.json();
  },
};