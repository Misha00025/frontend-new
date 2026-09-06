import type { NavItem } from '@tdn/shared';

// Навигация приложения «Игровые системы».
// Контент, версии и правила вложены в конкретную систему (/systems/:systemId/...),
// поэтому в глобальном меню остаются только «Системы» и «Профиль».
export const navItems: NavItem[] = [
  { id: 'systems', label: 'Системы', icon: '📚', path: '/systems' },
  { id: 'profile', label: 'Профиль', icon: '👤', path: '/profile' },
];
