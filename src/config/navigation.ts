import { NavigationConfig, NavigationItem } from '../types/navigation';

export const navigationConfig: NavigationConfig = {
  default: [
    { id: 'dashboard', label: 'Главная', path: '/dashboard', icon: '🏠' },
    { id: 'groups', label: 'Группы', path: '/groups', icon: '👥' },
    { id: 'profile', label: 'Профиль', path: '/profile', icon: '👤' },
  ],
  group: [
    { id: 'group-dashboard', label: 'Группа', path: '/group/:groupId', icon: '👥' },
    { id: 'users', label: 'Пользователи', path: '/group/:groupId/users', icon: '👥' },
    { id: 'templates', label: 'Шаблоны', path: '/group/:groupId/templates', icon: '📋' },
    { id: 'characters', label: 'Персонажи', path: '/group/:groupId/characters', icon: '🎭' },
    { id: 'items', label: 'Предметы', path: '/group/:groupId/items', icon: '🎒' },
    { id: 'notes', label: 'Заметки', path: '/group/:groupId/notes', icon: '📝' },
    { id: 'back', label: 'Назад к группам', path: '/groups', icon: '←', isBackButton: true },
  ],
  character: [
    { id: 'character', label: 'Карточка', path: '/group/:groupId/character/:characterId', icon: '👤' },
    { id: 'back', label: 'Назад к персонажам', path: '/groups/:groupId/characters', icon: '←', isBackButton: true },
  ],
};

const replacePath = (path: string, groupId?: string, characterId?: string) => {
  let newPath = path;
  if (groupId && newPath.includes(':groupId')) {
    newPath = newPath.replace(':groupId', groupId);
  }
  if (characterId && newPath.includes(':characterId')) {
    newPath = newPath.replace(':characterId', characterId);
  }
  return newPath;
};

export const getNavigationItems = (context: 'default' | 'group' | 'character', groupId?: string, characterId?: string): NavigationItem[] => {
  const items = navigationConfig[context];
  return items.map((item: NavigationItem) => ({
    ...item,
    path: replacePath(item.path, groupId, characterId),
  }));
};