let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

const tokenManager = {
  getAccessToken: (): string | null => accessToken,

  ensureToken: async (): Promise<string | null> => {
    if (accessToken) return accessToken;

    const savedRefreshToken = localStorage.getItem('refreshToken');
    if (!savedRefreshToken) return null;

    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const { getApiBase } = await import('../config');
        const API_BASE = getApiBase();
        const response = await fetch(`${API_BASE}/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            refresh_token: savedRefreshToken,
          }),
        });

        if (!response.ok) throw new Error('Token refresh failed');

        const data = await response.json();
        accessToken = data.access_token;
        localStorage.setItem('refreshToken', data.refresh_token);
        return accessToken;
      } catch {
        accessToken = null;
        localStorage.removeItem('refreshToken');
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  setTokens: (access: string, refresh: string) => {
    accessToken = access;
    localStorage.setItem('refreshToken', refresh);
  },

  clear: () => {
    accessToken = null;
    localStorage.removeItem('refreshToken');
  },
};

export default tokenManager;
