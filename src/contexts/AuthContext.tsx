import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, RefreshResponse } from '../types/auth';
import { authAPI } from '../services/api';
import { storage } from '../utils/storage';

interface AuthContextType {
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const savedAccessToken = storage.getAccessToken();
    const savedRefreshToken = storage.getRefreshToken();
    
    if (savedAccessToken) {
      setAccessToken(savedAccessToken);
    } else if (savedRefreshToken) {
      refreshAccessToken(savedRefreshToken);
    }
  }, []);

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const refreshData: RefreshResponse = await authAPI.refresh(refreshToken);
      setAccessToken(refreshData.accessToken);
      storage.setAccessToken(refreshData.accessToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const loginData: AuthResponse = await authAPI.login({ username, password });
      
      // Сохраняем refreshToken
      storage.setRefreshToken(loginData.token);
      
      // Получаем и сохраняем accessToken
      const refreshData: RefreshResponse = await authAPI.refresh(loginData.token);
      setAccessToken(refreshData.accessToken);
      storage.setAccessToken(refreshData.accessToken);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setAccessToken(null);
    storage.clearTokens();
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};