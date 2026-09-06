// Хаб (shell) — host-приложение микрофронтендов.
//
// Точка входа, общая левая панель, оркестрация сессии, монтирование remotes.
// Маршрутизация верхнего уровня (префиксы) — у хаба; детали доменов — у remotes.
//
// Провайдеры: Auth → Theme → Sidebar → Session → Router → AppContent.
// Порядок соответствует apps/campaign (AuthProvider снаружи, т.к. ThemeProvider
// зависит от useAuth).

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, SidebarProvider } from '@tdn/shared';
import { SessionProvider, useHubSession } from './session/SessionProvider';
import HubSidebar from './components/HubSidebar/HubSidebar';
import RemoteBoundary from './remote/RemoteBoundary';
import Login from './pages/Login';

// Гейт «не залогинен»: хаб решает, что пользователь не залогинен, и
// показывает страницу входа (remote login). Сессия прокидывается в remotes.
const AppContent: React.FC = () => {
  const { accessToken } = useHubSession();

  if (!accessToken) {
    return <Login />;
  }

  return (
    <>
      <HubSidebar />
      <main style={{ padding: '1rem' }}>
        <Routes>
          {/* Главная — общая вкладка. Подгружает ТОЛЬКО страницу «Главная»
              из campaign как готовый модуль (хаб не тянет домен кампании). */}
          <Route
            path="/"
            element={
              <RemoteBoundary name="campaign" module="Home" />
            }
          />
          {/* Игровые системы — remote владеет своей маршрутизацией. */}
          <Route
            path="/systems/*"
            element={
              <RemoteBoundary name="game-systems" module="App" />
            }
          />
          {/* Кампании — remote владеет своей маршрутизацией. */}
          <Route
            path="/campaign/*"
            element={
              <RemoteBoundary name="campaign" module="App" />
            }
          />
          {/* Профиль — remote. */}
          <Route
            path="/profile"
            element={
              <RemoteBoundary name="profile" module="App" />
            }
          />
          {/* Настройки — пока заглушка (владелец настроек темы — хаб). */}
          <Route path="/settings" element={<SettingsPlaceholder />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
};

const SettingsPlaceholder: React.FC = () => (
  <div>
    <h2>Настройки</h2>
    <p>Раздел настроек (владелец настроек темы — хаб).</p>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <SessionProvider>
            <Router basename={import.meta.env.BASE_URL}>
              <AppContent />
            </Router>
          </SessionProvider>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
