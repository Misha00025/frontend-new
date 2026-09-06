import type { NavItem } from '@tdn/shared';

// Навигация приложения «Игровые системы».
// Системы, контент-каталоги, версии, правила — пока пустые маршруты (наполнение в 3.6+).
export const navItems: NavItem[] = [
  { id: 'systems', label: 'Системы', icon: '📚', path: '/systems' },
  { id: 'content', label: 'Контент', icon: '🗂️', path: '/content' },
  { id: 'versions', label: 'Версии', icon: '🏷️', path: '/versions' },
  { id: 'rules', label: 'Правила', icon: '📜', path: '/rules' },
  { id: 'profile', label: 'Профиль', icon: '👤', path: '/profile' },
];
