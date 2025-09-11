import { useState, useCallback } from 'react';
import { WhoAmIResponse, UserProfile } from '../types/auth';
import { makeAuthenticatedRequest, refreshToken } from '../services/api';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Первый запрос: whoami
      const whoamiResponse = await makeAuthenticatedRequest('/api/whoami');
      
      if (whoamiResponse.status === 401) {
        // Попытка обновить токен
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          throw new Error('Session expired. Please login again.');
        }
        // Повторяем запрос после обновления токена
        await fetchProfile();
        return;
      }
      
      if (!whoamiResponse.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const whoamiData: WhoAmIResponse = await whoamiResponse.json();
      
      // Второй запрос: данные пользователя
      const profileResponse = await makeAuthenticatedRequest(`/api/users/${whoamiData.id}`);
      
      if (profileResponse.status === 401) {
        // Попытка обновить токен
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          throw new Error('Session expired. Please login again.');
        }
        // Повторяем запрос после обновления токена
        await fetchProfile();
        return;
      }
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const profileData: UserProfile = await profileResponse.json();
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, error, fetchProfile };
};