// hooks/useApi.ts
import { useState, useCallback } from 'react';
import { makeAuthenticatedRequest, refreshToken } from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Первый запрос
      let response = await makeAuthenticatedRequest(endpoint, options);
      
      // Если получили 401, пытаемся обновить токен и повторить запрос
      if (response.status === 401) {
        const refreshSuccess = await refreshToken();
        
        if (refreshSuccess) {
          // Повторяем запрос с новым токеном
          response = await makeAuthenticatedRequest(endpoint, options);
        } else {
          throw new Error('Session expired. Please login again.');
        }
      }
      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callApi, loading, error };
};