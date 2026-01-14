import { LoginData, AuthResponse, RefreshResponse, UserProfile } from '../types/auth';
import { CreateGroupRequest, Group, GroupsResponse } from '../types/group';
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
import { useAuth } from '../contexts/AuthContext';
import { CreateGroupSkillRequest, CreateSkillAttributeRequest, GroupSkill, GroupSkillsResponse, SkillAttributeDefinition, SkillAttributesResponse, UpdateGroupSkillRequest } from '../types/groupSkills';
import { GroupSchema } from '../types/groupSchemas';


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

  register: async (credentials: { username: string, password: string }): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (response.status === 409) {
      throw new Error('Username already exists');
    }
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
  },
};

// Флаг для отслеживания процесса обновления токена
let isRefreshing = false;
// Очередь запросов, которые нужно повторить после обновления токена
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

export const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}, contentType: string | null = 'application/json'): Promise<Response> => {
  const accessToken = storage.getAccessToken();
  const refreshToken = storage.getRefreshToken();
  const headers = contentType ? {
    'Content-Type': contentType,
    ...options.headers,
    ...(accessToken ? { 'Authorization': accessToken } : {}),
  } : {
    ...options.headers,
    ...(accessToken ? { 'Authorization': accessToken } : {}),
  };
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && refreshToken && !isRefreshing) {
      isRefreshing = true;
      try {
        const refreshData = await authAPI.refresh(refreshToken);
        const newAccessToken = refreshData.accessToken;
        
        storage.setAccessToken(newAccessToken);
        
        const newHeaders = {
          ...headers,
          'Authorization': newAccessToken,
        };
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers: newHeaders,
        });
        isRefreshing = false;
        processQueue();
        return retryResponse;
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        storage.clearTokens();
        window.location.reload();
        throw new Error('Session expired. Please login again.');
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

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

  createGroup: async (groupData: CreateGroupRequest): Promise<Group> => {
    const response = await makeAuthenticatedRequest('/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create group');
    }
    
    return response.json();
  },

  updateGroup: async (groupId: number, groupData: { name?: string; icon?: string }): Promise<Group> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
    });

    if (!response.ok) {
      throw new Error('Failed to update group');
    }

    return response.json();
  },

  getSchema: async (groupId: number, schemaType: 'items' | 'skills'): Promise<GroupSchema> => {
    try {
      const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/schemas/${schemaType}`);
      if (!response.ok) {
        // Если 404 - возвращаем пустую схему
        if (response.status === 404) {
          return { type: schemaType, groupBy: [] };
        }
        throw new Error(`Failed to fetch ${schemaType} schema`);
      }
      return response.json();
    } catch (error) {
      // При любой ошибке возвращаем пустую схему
      console.error(`Error fetching ${schemaType} schema:`, error);
      return { type: schemaType, groupBy: [] };
    }
  },

  // Общий метод для обновления схемы
  updateSchema: async (groupId: number, schemaType: 'items' | 'skills', groupBy: string[]): Promise<GroupSchema> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/schemas/${schemaType}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupBy }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update ${schemaType} schema`);
    }
    return response.json();
  },

  // Методы-обёртки для обратной совместимости и удобства
  getItemsSchema: async (groupId: number): Promise<GroupSchema> => {
    return groupAPI.getSchema(groupId, 'items');
  },

  getSkillsSchema: async (groupId: number): Promise<GroupSchema> => {
    return groupAPI.getSchema(groupId, 'skills');
  },

  updateItemsSchema: async (groupId: number, groupBy: string[]): Promise<GroupSchema> => {
    return groupAPI.updateSchema(groupId, 'items', groupBy);
  },

  updateSkillsSchema: async (groupId: number, groupBy: string[]): Promise<GroupSchema> => {
    return groupAPI.updateSchema(groupId, 'skills', groupBy);
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

  getTemplate: async (groupId: number, templateId: number): Promise<CharacterTemplate> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/templates/${templateId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }
    return response.json();
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

export const userAPI = {
  createProfile: async (profileData: { nickname: string, visibleName: string, imageLink?: string }): Promise<UserProfile> => {
    const response = await makeAuthenticatedRequest('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (response.status === 409) {
      throw new Error('Nickname already exists');
    }
    
    if (!response.ok) {
      throw new Error('Failed to create profile');
    }
    
    return response.json();
  },

  updateProfile: async (userId: number, profileData: { visibleName: string, imageLink?: string }): Promise<UserProfile> => {
    const response = await makeAuthenticatedRequest(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  },
};


export const groupSkillsAPI = {
  // Получить все навыки группы
  getSkills: async (groupId: number): Promise<GroupSkill[]> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/skills`);
    if (!response.ok) {
      throw new Error('Failed to fetch group skills');
    }
    const data: GroupSkillsResponse = await response.json();
    return data.skills;
  },

  // Получить конкретный навык
  getSkill: async (groupId: number, skillId: number): Promise<GroupSkill> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/skills/${skillId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch skill');
    }
    return response.json();
  },

  // Создать новый навык
  createSkill: async (groupId: number, skillData: CreateGroupSkillRequest): Promise<GroupSkill> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillData),
    });
    if (!response.ok) {
      throw new Error('Failed to create skill');
    }
    return response.json();
  },

  // Обновить навык
  updateSkill: async (groupId: number, skillId: number, skillData: UpdateGroupSkillRequest): Promise<GroupSkill> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/skills/${skillId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillData),
    });
    if (!response.ok) {
      throw new Error('Failed to update skill');
    }
    return response.json();
  },

  // Удалить навык
  deleteSkill: async (groupId: number, skillId: number): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/skills/${skillId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete skill');
    }
  },

  // Получить атрибуты навыков группы
  getSkillAttributes: async (groupId: number): Promise<SkillAttributeDefinition[]> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/skills/attributes`);
    if (!response.ok) {
      throw new Error('Failed to fetch skill attributes');
    }
    const data: SkillAttributesResponse = await response.json();
    return data.attributes;
  },

  // Добавить/обновить атрибут навыка
  updateSkillAttributes: async (groupId: number, attributesData: CreateSkillAttributeRequest[]): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/skills/attributes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({attributes: attributesData}),
    });
    if (!response.ok) {
      throw new Error('Failed to update skill attribute');
    }
  },

  // Получить навыки с фильтрацией по атрибутам
  getSkillsWithFilter: async (groupId: number, filters: Record<string, string>): Promise<GroupSkill[]> => {
    const params = new URLSearchParams(filters).toString();
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/skills?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch filtered skills');
    }
    const data: GroupSkillsResponse = await response.json();
    return data.skills;
  },
};

export const characterSkillsAPI = {
  // Получить навыки персонажа
  getCharacterSkills: async (groupId: number, characterId: number): Promise<GroupSkill[]> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}/skills`);
    if (!response.ok) {
      throw new Error('Failed to fetch character skills');
    }
    const data: GroupSkillsResponse = await response.json();
    return data.skills;
  },

  // Добавить навык персонажу
  addSkillToCharacter: async (groupId: number, characterId: number, skillId: number): Promise<GroupSkill> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}/skills/${skillId}`, {
      method: 'PUT',
    });
    if (!response.ok) {
      throw new Error('Failed to add skill to character');
    }
    return response.json();
  },

  // Удалить навык у персонажа
  removeSkillFromCharacter: async (groupId: number, characterId: number, skillId: number): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/groups/${groupId}/characters/${characterId}/skills/${skillId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove skill from character');
    }
  },
};

export const uploadAPI = {
  uploadImage: async (file: File): Promise<{ url: string; fileName: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    // Для FormData не устанавливаем Content-Type вручную, браузер сделает это автоматически
    const response = await makeAuthenticatedRequest('/upload', {
      method: 'POST',
      body: formData,
    },
      null
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return response.json();
  },
};