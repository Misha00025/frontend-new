import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ThemeProvider, SidebarProvider } from '@tdn/shared';
import Login from './pages/Login';
import AppLayout from './layout/AppLayout';
import SystemsList from './pages/SystemsList';
import SystemLayout from './pages/SystemLayout';
import SystemOverview from './pages/SystemOverview';
import WorkInProgress from './pages/WorkInProgress';

// Провайдеры: Auth → Theme → Sidebar → Router → AppContent.
// Порядок соответствует apps/campaign (AuthProvider снаружи, т.к. ThemeProvider зависит от useAuth).
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <Router basename={import.meta.env.BASE_URL}>
            <AppContent />
          </Router>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
