// src/hooks/useProfile.ts
import { useState, useCallback, useEffect } from 'react';
import { WhoAmIResponse, UserProfile } from '../types/auth';
import { makeAuthenticatedRequest, refreshToken } from '../services/api';

export const useProfile = (fetchOnMount: boolean = false) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState<string | null>(null);
  const [profileNotFound, setProfileNotFound] = useState(false);

  const fetchProfile = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setProfileNotFound(false);
    
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
        return fetchProfile();
      }
      
      if (!whoamiResponse.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const whoamiData: WhoAmIResponse = await whoamiResponse.json();
      
      // Второй запрос: данные пользователя
      const profileResponse = await makeAuthenticatedRequest(`/api/users/${whoamiData.id}`);
      
      if (profileResponse.status === 404) {
        setProfileNotFound(true);
        return;
      }
      
      if (profileResponse.status === 401) {
        // Попытка обновить токен
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          throw new Error('Session expired. Please login again.');
        }
        // Повторяем запрос после обновления токена
        return fetchProfile();
      }
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const profileData: UserProfile = await profileResponse.json();
      setProfile(profileData);
      setProfileNotFound(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchOnMount) {
      fetchProfile();
    }
  }, [fetchOnMount, fetchProfile]);

  return { profile, loading, error, profileNotFound, fetchProfile };
};