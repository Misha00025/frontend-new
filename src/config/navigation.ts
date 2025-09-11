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
    { id: 'characters', label: 'Персонажи', path: '/group/:groupId/characters', icon: '🎭' },
    { id: 'items', label: 'Предметы', path: '/group/:groupId/items', icon: '🎒' },
    { id: 'notes', label: 'Заметки', path: '/group/:groupId/notes', icon: '📝' },
    { id: 'back', label: 'Назад к группам', path: '/groups', icon: '←', isBackButton: true },
  ],
};

export const getNavigationItems = (context: 'default' | 'group', groupId?: string): NavigationItem[] => {
  const items = navigationConfig[context];
  
  if (groupId) {
    return items.map((item: NavigationItem) => ({
      ...item,
      path: item.path.replace(':groupId', groupId),
    }));
  }
  
  return items;
};