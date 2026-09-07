// src/App.tsx
// Профиль — remote-приложение микрофронтендов.
//
// НОВЫЙ КОНТРАКТ (тикет #19): роутером владеет хаб. Remote НЕ создаёт
// собственный Router и НЕ рендерит общие провайдеры (Auth/Theme/Session) —
// их даёт хаб. Здесь — только маршруты через <Routes> (требует родительский
// Router от хаба).
//
// Хаб монтирует приложение под префиксом /profile/*, поэтому маршруты —
// ОТНОСИТЕЛЬНЫЕ (без префикса /profile): '/' = профиль.
// Автономный запуск (standalone): main.tsx оборачивает этот же компонент
// в свой Router (basename '/profile') + общие провайдеры (Auth/Theme/Session).

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@tdn/shared/auth/AuthContext';
import { setApiBase } from '@tdn/shared/config';
import Login from './pages/Login';
import Profile from './pages/Profile';

const AppContent: React.FC = () => {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Profile />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC<{ apiBase?: string }> = ({ apiBase }) => {
  // В режиме хаба хаб прокидывает свой API_BASE — переопределяем фолбэк.
  useEffect(() => {
    if (apiBase) setApiBase(apiBase);
  }, [apiBase]);

  return <AppContent />;
};

export default App;
