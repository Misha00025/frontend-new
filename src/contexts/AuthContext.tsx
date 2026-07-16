import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TokenResponse, WhoAmIResponse } from '../types/auth';
import { authAPI, makeAuthenticatedRequest } from '../services/api';
import { storage } from '../utils/storage';

interface AuthContextType {
  accessToken: string | null;
  userId: number | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedRefreshToken = storage.getRefreshToken();

      if (!savedRefreshToken) {
        setInitializing(false);
        return;
      }

      try {
        const tokenData: TokenResponse = await authAPI.refresh(savedRefreshToken);
        storage.setAccessToken(tokenData.access_token);
        storage.setRefreshToken(tokenData.refresh_token);
        setAccessToken(tokenData.access_token);

        // Получаем whoami
        const whoamiResponse = await makeAuthenticatedRequest('/whoami');
        if (whoamiResponse.ok) {
          const whoamiData: WhoAmIResponse = await whoamiResponse.json();
          setUserId(whoamiData.id);
          localStorage.setItem('userId', whoamiData.id.toString());
        }
      } catch (error) {
        console.error('Session restore failed:', error);
        storage.clearTokens();
        localStorage.removeItem('userId');
      } finally {
        setInitializing(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const tokenData: TokenResponse = await authAPI.login({ username, password });

      storage.setAccessToken(tokenData.access_token);
      storage.setRefreshToken(tokenData.refresh_token);
      setAccessToken(tokenData.access_token);

      const whoamiResponse = await makeAuthenticatedRequest('/whoami');
      if (whoamiResponse.ok) {
        const whoamiData: WhoAmIResponse = await whoamiResponse.json();
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

  if (initializing) {
    return null; // Или можно показать лоадер
  }

  return (
    <AuthContext.Provider value={{
      accessToken,
      userId,
      login,
      register,
      logout,
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
