let accessToken: string | null = null;

export const storage = {
  setAccessToken: (token: string) => {
    accessToken = token;
  },
  getAccessToken: (): string | null => {
    return accessToken;
  },
  removeAccessToken: () => {
    accessToken = null;
  },

  setRefreshToken: (token: string) => localStorage.setItem('refreshToken', token),
  getRefreshToken: (): string | null => localStorage.getItem('refreshToken'),
  removeRefreshToken: () => localStorage.removeItem('refreshToken'),

  clearTokens: () => {
    accessToken = null;
    localStorage.removeItem('refreshToken');
  },

  setSelectedGroupId: (groupId: string) => localStorage.setItem('selectedGroupId', groupId),
  getSelectedGroupId: (): string | null => localStorage.getItem('selectedGroupId'),
  clearSelectedGroupId: () => localStorage.removeItem('selectedGroupId'),
};
