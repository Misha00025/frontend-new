import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TokenResponse, WhoAmIResponse } from '../types/auth';
import { authAPI, makeAuthenticatedRequest } from '../services/api';
import tokenManager from '../services/tokenManager';

interface AuthContextType {
  accessToken: string | null;
  userId: number | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = await tokenManager.ensureToken();

      if (token) {
        try {
          const whoamiResponse = await makeAuthenticatedRequest('/whoami');
          if (whoamiResponse.ok) {
            const whoamiData: WhoAmIResponse = await whoamiResponse.json();
            setUserId(whoamiData.id);
            localStorage.setItem('userId', whoamiData.id.toString());
          }
        } catch (error) {
          console.error('Session restore failed:', error);
          tokenManager.clear();
          localStorage.removeItem('userId');
        }
      }

      setInitializing(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const tokenData: TokenResponse = await authAPI.login({ username, password });
      tokenManager.setTokens(tokenData.access_token, tokenData.refresh_token);

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
      const tokenData: TokenResponse = await authAPI.register({ username, password });
      tokenManager.setTokens(tokenData.access_token, tokenData.refresh_token);

      const whoamiResponse = await makeAuthenticatedRequest('/whoami');
      if (whoamiResponse.ok) {
        const whoamiData: WhoAmIResponse = await whoamiResponse.json();
        setUserId(whoamiData.id);
        localStorage.setItem('userId', whoamiData.id.toString());
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUserId(null);
    tokenManager.clear();
    localStorage.removeItem('userId');
  };

  if (initializing) {
    return null;
  }

  return (
    <AuthContext.Provider value={{
      accessToken: tokenManager.getAccessToken(),
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
