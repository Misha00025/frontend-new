// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GroupProvider } from './contexts/GroupContext';
import { useProfile } from './hooks/useProfile';
import CompleteRegistration from './pages/Authorisation/CompleteRegistration';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupLayout from './pages/Group/GroupLayout';
import GroupSettings from './pages/Group/GroupSettings';
import GroupUsers from './pages/Group/GroupUsers';
import CharacterTemplates from './pages/Group/Characters/Template/CharacterTemplates';
import Characters from './pages/Group/Characters/Characters';
import CharacterLayout from './pages/Group/Characters/CharacterLayout';
import Character from './pages/Group/Characters/Character/Character';
import CharacterItems from './pages/Group/Characters/Character/CharacterItems';
import CharacterSkills from './pages/Group/Characters/Character/CharacterSkills';
import CharacterNotes from './pages/Group/Characters/Character/CharacterNotes';
import GroupItems from './pages/Group/GroupItems';
import Profile from './pages/Profile';
import './styles/globals.css';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { SidebarProvider } from './contexts/SidebarContext';
import WorkInProgress from './pages/WorkInProgress';
import GroupSkills from './pages/Group/GroupSkills';
import Login from './pages/Authorisation/Login';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { accessToken } = useAuth();
  const { profile, loading, profileNotFound, fetchProfile } = useProfile(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (accessToken && !loading) {
      if (profileNotFound && location.pathname !== '/complete-registration') {
        navigate('/complete-registration', { replace: true });
      }
      else if (!profileNotFound && location.pathname === '/complete-registration')
      {
        navigate('/profile', { replace: true })
      }
    }
  }, [accessToken, loading, profileNotFound, navigate, location.pathname]);

  // При изменении accessToken перезагружаем профиль
  useEffect(() => {
    if (accessToken) {
      fetchProfile();
    }
  }, [accessToken, fetchProfile]);

  if (!accessToken) {
    return <Login />;
  }

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/complete-registration" element={<CompleteRegistration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/group/:groupId" element={<GroupLayout />}>
          <Route index element={<Navigate to="characters" replace />} />
          <Route path="characters" element={<Characters />} />
          <Route path="settings" element={<GroupSettings />} />
          <Route path="users" element={<GroupUsers />} />
          <Route path="templates" element={<CharacterTemplates />} />
          <Route path="skills" element={<GroupSkills />} />
          <Route path="items" element={<GroupItems />} />
        </Route>
        <Route path="/group/:groupId/character/:characterId" element={<CharacterLayout />}>
          <Route index element={<Character />} />
          <Route path="items" element={<CharacterItems />} />
          <Route path="skills" element={<CharacterSkills />} />
          <Route path="notes" element={<CharacterNotes />} />
        </Route>
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GroupProvider>
          <Router>
            <PermissionsProvider>
              <SidebarProvider>
                <AppContent />
              </SidebarProvider>
            </PermissionsProvider>
          </Router>
        </GroupProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;