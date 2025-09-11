export const storage = {
  setAccessToken: (token: string) => localStorage.setItem('accessToken', token),
  getAccessToken: () => localStorage.getItem('accessToken'),
  setRefreshToken: (token: string) => localStorage.setItem('refreshToken', token),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  setSelectedGroupId: (groupId: string) => localStorage.setItem('selectedGroupId', groupId),
  getSelectedGroupId: () => localStorage.getItem('selectedGroupId'),
  clearSelectedGroupId: () => localStorage.removeItem('selectedGroupId'),
};