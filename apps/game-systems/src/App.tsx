// src/App.tsx
// Игровые системы — remote-приложение микрофронтендов.
//
// Монтируется хабом под префиксом /systems/* (модуль game-systems/App) либо
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
import AppLayout from './layout/AppLayout';
import SystemsList from './pages/SystemsList';
import SystemLayout from './pages/SystemLayout';
import SystemOverview from './pages/SystemOverview';
import WorkInProgress from './pages/WorkInProgress';
import { SessionProvider } from './session/SessionProvider';
import type { GameSystemsSession } from './session';

const AppContent: React.FC = () => {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Login />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/systems" element={<SystemsList />} />
        <Route path="/systems/:systemId" element={<SystemLayout />}>
          <Route index element={<SystemOverview />} />
          <Route path="content" element={<WorkInProgress />} />
          <Route path="versions" element={<WorkInProgress />} />
          <Route path="rules" element={<WorkInProgress />} />
        </Route>
        <Route path="/profile" element={<WorkInProgress />} />
      </Route>
      <Route path="/login" element={<Navigate to="/systems" replace />} />
      <Route path="/" element={<Navigate to="/systems" replace />} />
      <Route path="*" element={<Navigate to="/systems" replace />} />
    </Routes>
  );
};

interface AppProps {
  /** Сессия, прокидываемая хабом (см. session.ts). */
  session?: GameSystemsSession;
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
