// src/navigation.ts
// Навигация кампании.
//
// Кампания — remote: монтируется хабом под префиксом (/groups/*) либо
// автономно (standalone, префикс ''). Внутренняя навигация должна быть
// относительной к корню кампании, чтобы работать в обоих случаях.
// Здесь — хелпер, который вычисляет базовый префикс кампании из текущего
// URL и навигирует относительно него.

import { useLocation, useNavigate } from 'react-router-dom';

// Первые сегменты маршрутов кампании (верхний уровень). По ним определяем,
// где начинается корень кампании в текущем pathname.
const CAMPAIGN_ROUTE_SEGMENTS = [
  'groups',
  'profile',
  'complete-registration',
  'login',
];

/**
 * Возвращает базовый префикс кампании в текущем pathname.
 * Например: '/groups' (под хабом) или '' (standalone).
 *
 * Если в pathname нет ни одного сегмента маршрута кампании — значит, весь
 * путь и есть базовый префикс (например '/groups' или '/hub/groups').
 * Это нужно для вычисления basename роутера при монтировании хабом.
 */
export const getCampaignBase = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean);
  const idx = parts.findIndex((p) => CAMPAIGN_ROUTE_SEGMENTS.includes(p));
  if (idx === -1) return '/' + parts.join('/');
  return '/' + parts.slice(0, idx).join('/');
};

/**
 * useNavigate, но относительно корня кампании.
 * Аргумент `to` — абсолютный путь внутри кампании (например '/groups'),
 * к нему автоматически добавляется базовый префикс кампании.
 */
export const useCampaignNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const base = getCampaignBase(location.pathname);
  return (to: string, opts?: { replace?: boolean }) =>
    navigate(`${base}${to}`, opts);
};

/**
 * useCampaignPath — возвращает функцию, которая превращает абсолютный путь
 * внутри кампании (например '/groups') в путь с учётом базового префикса
 * кампании ('/groups/groups' под хабом, '/groups' standalone).
 * Полезно для ссылок (breadcrumbs, табы).
 */
export const useCampaignPath = () => {
  const location = useLocation();
  const base = getCampaignBase(location.pathname);
  return (to: string) => `${base}${to}`;
};
