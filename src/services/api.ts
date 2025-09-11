import { LoginData, AuthResponse, RefreshResponse } from '../types/auth';
import { Group, GroupsResponse } from '../types/group';
import { storage } from '../utils/storage';
import { GroupUser, GroupUsersResponse, SearchUsersResponse, User } from '../types/groupUsers';
import {
  CharacterTemplate,
  CharacterTemplatesResponse,
  CreateTemplateRequest,
  UpdateTemplateRequest
} from '../types/characterTemplates';
import {
  CharacterShort,
  Character,
  CreateCharacterRequest,
  UpdateCharacterRequest
} from '../types/characters';
import { CharacterUser, CharacterUsersResponse } from '../types/characterUsers';
import {
  GroupItem,
  GroupItemsResponse,
  CreateGroupItemRequest,
  UpdateGroupItemRequest
} from '../types/groupItems';
import {
  CharacterItem,
  CharacterItemsResponse,
  CreateCharacterItemRequest,
  UpdateCharacterItemRequest
} from '../types/characterItems';


const API_BASE = 'https://thedun.ru';

export const authAPI = {
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  refresh: async (token: string): Promise<RefreshResponse> => {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Refresh-Token': token },
    });
    return response.json();
  },
};

export const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = storage.getAccessToken();
  
  // Добавляем токен в заголовки, если он есть
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken ? { 'Authorization': accessToken } : {}),
  };
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  return response;
};

// Отдельная функция для обработки обновления токена
export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const refreshData = await authAPI.refresh(refreshToken);
    storage.setAccessToken(refreshData.accessToken);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    storage.clearTokens();
    return false;
  }
};

export const groupAPI = {
  getGroups: async (): Promise<Group[]> => {
    const response = await makeAuthenticatedRequest('/api/groups');
    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }
    const data: GroupsResponse = await response.json();
    return data.groups;
  },

  getGroup: async (groupId: number): Promise<Group> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch group');
    }
    return response.json();
  },
};


export const groupUsersAPI = {
  searchUsers: async (nickname: string): Promise<User[]> => {
    const response = await makeAuthenticatedRequest(`/api/users?nickname=${encodeURIComponent(nickname)}`);
    if (!response.ok) {
      throw new Error('Failed to search users');
    }
    const data: SearchUsersResponse = await response.json();
    return data.users;
  },

  getGroupUsers: async (groupId: number): Promise<GroupUser[]> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch group users');
    }
    const data: GroupUsersResponse = await response.json();
    return data.users;
  },

  addUserToGroup: async (groupId: number, userId: number, isAdmin: boolean): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isAdmin }),
    });
    if (!response.ok) {
      throw new Error('Failed to add user to group');
    }
  },

  removeUserFromGroup: async (groupId: number, userId: number): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove user from group');
    }
  },
};


export const characterTemplatesAPI = {
  getTemplates: async (groupId: number): Promise<CharacterTemplate[]> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/templates`);
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    const data: CharacterTemplatesResponse = await response.json();
    return data.templates;
  },

  createTemplate: async (groupId: number, templateData: CreateTemplateRequest): Promise<CharacterTemplate> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });
    if (!response.ok) {
      throw new Error('Failed to create template');
    }
    return response.json();
  },

  updateTemplate: async (groupId: number, templateId: number, templateData: UpdateTemplateRequest): Promise<CharacterTemplate> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update template');
    }
    return response.json();
  },

  deleteTemplate: async (groupId: number, templateId: number): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/templates/${templateId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete template');
    }
  },
};

export const charactersAPI = {
  getCharacters: async (groupId: number): Promise<CharacterShort[]> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters`);
    if (!response.ok) {
      throw new Error('Failed to fetch characters');
    }
    return response.json();
  },

  getCharacter: async (groupId: number, characterId: number): Promise<Character> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch character');
    }
    return response.json();
  },

  createCharacter: async (groupId: number, characterData: CreateCharacterRequest): Promise<Character> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(characterData),
    });
    if (!response.ok) {
      throw new Error('Failed to create character');
    }
    return response.json();
  },

  updateCharacter: async (groupId: number, characterId: number, characterData: UpdateCharacterRequest): Promise<Character> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(characterData),
    });
    if (!response.ok) {
      throw new Error('Failed to update character');
    }
    return response.json();
  },

  deleteCharacter: async (groupId: number, characterId: number): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete character');
    }
  },
};

export const characterUsersAPI = {
  getCharacterUsers: async (groupId: number, characterId: number): Promise<CharacterUser[]> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch character users');
    }
    const data: CharacterUsersResponse = await response.json();
    return data.users;
  },

  addUserToCharacter: async (groupId: number, characterId: number, userId: number, canWrite: boolean): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ canWrite }),
    });
    if (!response.ok) {
      throw new Error('Failed to add user to character');
    }
  },

  removeUserFromCharacter: async (groupId: number, characterId: number, userId: number): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove user from character');
    }
  },
};

export const groupItemsAPI = {
  getItems: async (groupId: number): Promise<GroupItem[]> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/items`);
    if (!response.ok) {
      throw new Error('Failed to fetch group items');
    }
    const data: GroupItemsResponse = await response.json();
    return data.items;
  },

  createItem: async (groupId: number, itemData: CreateGroupItemRequest): Promise<GroupItem> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      throw new Error('Failed to create group item');
    }
    return response.json();
  },

  updateItem: async (groupId: number, itemId: number, itemData: UpdateGroupItemRequest): Promise<GroupItem> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      throw new Error('Failed to update group item');
    }
    return response.json();
  },

  deleteItem: async (groupId: number, itemId: number): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/items/${itemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete group item');
    }
  },
};

export const characterItemsAPI = {
  getCharacterItems: async (groupId: number, characterId: number): Promise<CharacterItem[]> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}/items`);
    if (!response.ok) {
      throw new Error('Failed to fetch character items');
    }
    const data: CharacterItemsResponse = await response.json();
    return data.items;
  },

  createCharacterItem: async (groupId: number, characterId: number, itemData: CreateCharacterItemRequest): Promise<CharacterItem> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      throw new Error('Failed to create character item');
    }
    return response.json();
  },

  updateCharacterItem: async (groupId: number, characterId: number, itemId: number, itemData: UpdateCharacterItemRequest): Promise<CharacterItem> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      throw new Error('Failed to update character item');
    }
    return response.json();
  },

  deleteCharacterItem: async (groupId: number, characterId: number, itemId: number): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}/items/${itemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete character item');
    }
  },
};