// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GroupProvider } from './contexts/GroupContext';
import { useProfile } from './hooks/useProfile';
import Sidebar from './components/commons/Sidebar/Sidebar';
import Login from './pages/Login';
import CompleteRegistration from './pages/CompleteRegistration';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDashboard from './pages/Group/GroupDashboard';
import GroupUsers from './pages/Group/GroupUsers';
import CharacterTemplates from './pages/Group/CharacterTemplates';
import Characters from './pages/Group/Characters';
import Character from './pages/Character/Character';
import CharacterUsers from './pages/Character/CharacterUsers';
import CharacterItems from './pages/Character/CharacterItems';
import GroupItems from './pages/Group/GroupItems';
import Profile from './pages/Profile';
import './styles/globals.css';
import { PermissionsProvider } from './contexts/PermissionsContext';
import WorkInProgress from './pages/WorkInProgress';
import GroupSkills from './pages/Group/GroupSkills';
import CharacterSkills from './pages/Character/CharacterSkills';

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
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <Routes>
        <Route path="/complete-registration" element={<CompleteRegistration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/group/:groupId" element={<GroupDashboard />} />
        <Route path="/group/:groupId/users" element={<GroupUsers />} />
        <Route path="/group/:groupId/templates" element={<CharacterTemplates />} />
        <Route path="/group/:groupId/characters" element={<Characters />} />
        <Route path="/group/:groupId/skills" element={<GroupSkills />} />
        <Route path="/group/:groupId/character/:characterId" element={<Character />} />
        <Route path="/group/:groupId/character/:characterId/users" element={<CharacterUsers />} />
        <Route path="/group/:groupId/character/:characterId/items" element={<CharacterItems />} />
        <Route path="/group/:groupId/character/:characterId/skills" element={<CharacterSkills />} />
        <Route path="/group/:groupId/items" element={<GroupItems />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GroupProvider>
          <Router>
            <PermissionsProvider>
              <AppContent />
            </PermissionsProvider>
          </Router>
        </GroupProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;