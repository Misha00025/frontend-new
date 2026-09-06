// src/App.tsx
// Профиль — remote-приложение микрофронтендов.
//
// Монтируется хабом под префиксом /profile (модуль profile/App) либо
// автономно (standalone). Маршрутизация — у приложения (вложенные роутеры).
// Собственной навигации/панели нет — её передаёт хаб.
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
import Profile from './pages/Profile';
import { SessionProvider } from './session/SessionProvider';
import type { ProfileSession } from './session';

const AppContent: React.FC = () => {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Navigate to="/profile" replace />} />
      <Route path="/" element={<Navigate to="/profile" replace />} />
      <Route path="*" element={<Navigate to="/profile" replace />} />
    </Routes>
  );
};

interface AppProps {
  /** Сессия, прокидываемая хабом (см. session.ts). */
  session?: ProfileSession;
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
