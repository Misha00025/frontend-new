import React, { createContext, useContext, useState } from 'react';
import { AuthResponse, RefreshResponse } from '../types/auth';
import { authAPI } from '../services/api';

interface AuthContextType {
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const loginData: AuthResponse = await authAPI.login({ username, password });
      const refreshData: RefreshResponse = await authAPI.refresh(loginData.token);
      setAccessToken(refreshData.accessToken);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => setAccessToken(null);

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