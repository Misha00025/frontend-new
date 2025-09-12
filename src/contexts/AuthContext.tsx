// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthResponse, RefreshResponse } from '../types/auth';
import { authAPI, makeAuthenticatedRequest } from '../services/api';
import { storage } from '../utils/storage';

interface AuthContextType {
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

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
      
      storage.setRefreshToken(loginData.token);
      
      const refreshData: RefreshResponse = await authAPI.refresh(loginData.token);
      setAccessToken(refreshData.accessToken);
      storage.setAccessToken(refreshData.accessToken);
      
      const whoamiResponse = await makeAuthenticatedRequest('/api/whoami');
      if (whoamiResponse.ok) {
        const whoamiData = await whoamiResponse.json();
        setUserId(whoamiData.id);
        localStorage.setItem('userId', whoamiData.id.toString());
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      await authAPI.register({ username, password });
      await login(username, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUserId(null);
    storage.clearTokens();
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ 
      accessToken, 
      login,
      register,
      logout
    }}>
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