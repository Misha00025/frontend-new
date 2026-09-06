// src/App.tsx
// Login — remote-приложение микрофронтендов.
//
// Монтируется хабом под префиксом /login (модуль login/App) либо автономно
// (standalone). Маршрутизация — у приложения (вложенные роутеры).
//
// Login — отдельный домен, полностью независим от остальных приложений.
// Он пишет токен в общее хранилище сессии (shared-синглтон @tdn/shared
// tokenManager/AuthContext), которое разделяют все приложения.
//
// Сессия: хаб прокидывает её через пропс `session` (см. session.ts).
// При автономном запуске (без хаба) сессия грузится из хранилища (fallback)
// — см. session/SessionProvider.tsx.
//
// Провайдеры: Auth → Theme → Session → Router → AppContent.
// (AuthProvider/ThemeProvider — из @tdn/shared; при монтировании хабом они
// уже есть в дереве, но здесь они идемпотентны и нужны для автономного запуска.)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@tdn/shared/auth/AuthContext';
import { ThemeProvider } from '@tdn/shared/theme/ThemeContext';
import Login from './pages/Login';
import { SessionProvider } from './session/SessionProvider';
import type { LoginSession } from './session';

const AppContent: React.FC = () => {
  const { accessToken } = useAuth();

  // Уже залогинен — на корень (хаб сам решает, куда вести после входа).
  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

interface AppProps {
  /** Сессия, прокидываемая хабом (см. session.ts). */
  session?: LoginSession;
}

const App: React.FC<AppProps> = ({ session }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SessionProvider session={session}>
          <Router basename={import.meta.env.BASE_URL}>
            <AppContent />
          </Router>
        </SessionProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
