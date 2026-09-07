// src/App.tsx
// Кампания — remote-приложение микрофронтендов.
//
// НОВЫЙ КОНТРАКТ (тикет #19): роутером владеет хаб. Remote НЕ создаёт
// собственный Router и НЕ рендерит общие провайдеры (Auth/Theme/Session) —
// их даёт хаб. Здесь — только доменные провайдеры кампании + маршруты
// через <Routes> (требует родительский Router от хаба).
//
// Автономный запуск (standalone): main.tsx оборачивает этот же компонент
// в свой Router + общие провайдеры (Auth/Theme/Session).
//
// Провайдеры: Group → Visited → GroupUsers → Permissions → AppContent.
// (GroupSchemasBoundary — внутри маршрутов, зависит от :groupId.)

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams, Outlet } from 'react-router-dom';
import { GroupSchemasProvider } from './contexts/GroupSchemasContext';
import { useAuth } from '@tdn/shared/auth/AuthContext';
import { GroupProvider } from './contexts/GroupContext';
import { VisitedProvider } from './contexts/VisitedContext';
import { useProfile } from '@tdn/shared/auth/useProfile';
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
import CharacterDashboard from './pages/Group/Characters/Character/CharacterDashboard';
import CharacterItems from './pages/Group/Characters/Character/CharacterItems';
import CharacterSkills from './pages/Group/Characters/Character/CharacterSkills';
import CharacterNotes from './pages/Group/Characters/Character/CharacterNotes';
import CharacterQuests from './pages/Group/Characters/CharacterQuests';
import GroupItems from './pages/Group/GroupItems';
import GroupNotes from './pages/Group/GroupNotes';
import GroupQuests from './pages/Group/GroupQuests';
import '@tdn/shared/styles/globals.css';
import { GroupUsersProvider } from './contexts/GroupUsersContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import GroupSkills from './pages/Group/GroupSkills';

const GroupSchemasBoundary: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  if (!groupId) {
    return <Outlet />;
  }
  return (
    <GroupSchemasProvider groupId={Number(groupId)}>
      <Outlet />
    </GroupSchemasProvider>
  );
};

const AppContent: React.FC = () => {
  const { accessToken } = useAuth();
  const { loading, profileNotFound, fetchProfile } = useProfile();
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
    // Страница входа вынесена в отдельный remote-домен apps/login.
    // Здесь (кампания) при отсутствии токена просто не рендерим домен —
    // гейт «не залогинен» обрабатывает хаб, который показывает remote login.
    return null;
  }

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Routes>
      <Route path="/complete-registration" element={<CompleteRegistration />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/group/:groupId" element={<GroupSchemasBoundary />}>
        <Route element={<GroupLayout />}>
          <Route index element={<Navigate to="characters" replace />} />
          <Route path="characters" element={<Characters />} />
          <Route path="settings" element={<GroupSettings />} />
          <Route path="users" element={<GroupUsers />} />
          <Route path="templates" element={<CharacterTemplates />} />
          <Route path="skills" element={<GroupSkills />} />
          <Route path="items" element={<GroupItems />} />
          <Route path="notes" element={<GroupNotes />} />
          <Route path="quests" element={<GroupQuests />} />
        </Route>
        <Route path="character/:characterId" element={<CharacterLayout />}>
          <Route index element={<CharacterDashboard />} />
          <Route path="resources" element={<CharacterDashboard />} />
          <Route path="stats" element={<Character />} />
          <Route path="items" element={<CharacterItems />} />
          <Route path="skills" element={<CharacterSkills />} />
          <Route path="quests" element={<CharacterQuests />} />
          <Route path="notes" element={<CharacterNotes />} />
        </Route>
      </Route>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <GroupProvider>
      <VisitedProvider>
        <GroupUsersProvider>
          <PermissionsProvider>
            <AppContent />
          </PermissionsProvider>
        </GroupUsersProvider>
      </VisitedProvider>
    </GroupProvider>
  );
};

export default App;
