import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import './styles/globals.css';
import Groups from './pages/Groups';
import { GroupProvider } from './contexts/GroupContext';
import GroupDashboard from './pages/GroupDashboard';
import GroupUsers from './pages/GroupUsers';
import CharacterTemplates from './pages/CharacterTemplates';
import Characters from './pages/Characters';
import Character from './pages/Character';
import CharacterUsers from './pages/CharacterUsers';

const AppContent: React.FC = () => {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Login />;
  }

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/group/:groupId" element={<GroupDashboard />} />
          <Route path="/group/:groupId/users" element={<GroupUsers />} />
          <Route path="/group/:groupId/templates" element={<CharacterTemplates />} />
          <Route path="/group/:groupId/characters" element={<Characters />} />
          <Route path="/group/:groupId/character/:characterId" element={<Character />} />
          <Route path="/group/:groupId/character/:characterId/users" element={<CharacterUsers />} />
          <Route path="/group/:groupId/items" element={<div>Предметы (в разработке)</div>} />
          <Route path="/group/:groupId/notes" element={<div>Заметки (в разработке)</div>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GroupProvider>
          <AppContent />
        </GroupProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;