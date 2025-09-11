// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GroupProvider } from './contexts/GroupContext';
import { useProfile } from './hooks/useProfile';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './pages/Login';
import CompleteRegistration from './pages/CompleteRegistration';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDashboard from './pages/GroupDashboard';
import GroupUsers from './pages/GroupUsers';
import CharacterTemplates from './pages/CharacterTemplates';
import Characters from './pages/Characters';
import Character from './pages/Character';
import CharacterUsers from './pages/CharacterUsers';
import CharacterItems from './pages/CharacterItems';
import GroupItems from './pages/GroupItems';
import Profile from './pages/Profile';
import './styles/globals.css';

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
        <Route path="/group/:groupId/character/:characterId" element={<Character />} />
        <Route path="/group/:groupId/character/:characterId/users" element={<CharacterUsers />} />
        <Route path="/group/:groupId/character/:characterId/items" element={<CharacterItems />} />
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
            <AppContent />
          </Router>
        </GroupProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;