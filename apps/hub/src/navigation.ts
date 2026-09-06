// Навигация хаба (верхний уровень).
//
// Хаб знает только верхний уровень маршрутов (префиксы), не детали доменов:
//   - Главная  → /            (общая вкладка, подгружает ТОЛЬКО страницу
//                              «Главная» из campaign как готовый модуль)
//   - Игровые системы → /systems/*
//   - Кампании  → /campaign/*
//   - Профиль   → /profile
// Внизу панели — Настройки и Выход (см. HubSidebar).

import type { NavItem } from '@tdn/shared';

export const hubNavItems: NavItem[] = [
  { id: 'home', label: 'Главная', icon: '🏠', path: '/' },
  { id: 'systems', label: 'Игровые системы', icon: '📚', path: '/systems' },
  { id: 'campaign', label: 'Кампании', icon: '👥', path: '/campaign' },
  { id: 'profile', label: 'Профиль', icon: '👤', path: '/profile' },
];
