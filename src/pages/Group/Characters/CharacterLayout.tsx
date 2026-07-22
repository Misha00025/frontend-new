import React, { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { usePlatform } from '../../../hooks/usePlatform';
import { charactersAPI, groupAPI } from '../../../services/api';
import { Character } from '../../../types/characters';
import { Group } from '../../../types/group';
import PageLayout from '../../../components/commons/PageLayout/PageLayout';
import PageHeader from '../../../components/commons/PageLayout/PageHeader';
import ActionLogSidebar from '../../../components/commons/ActionLogSidebar/ActionLogSidebar';
import { TabItem } from '../../../components/commons/PageLayout/TabBar';
import { useVisited } from '../../../contexts/VisitedContext';
import { useDashboardSettings } from '../../../hooks/useDashboardSettings';
import { DashboardSettingsProvider, DashboardSettingsContextType } from '../../../contexts/DashboardSettingsContext';

const CharacterLayout: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const isMobile = usePlatform();

  const [character, setCharacter] = useState<Character | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { visitCharacter } = useVisited();

  useEffect(() => {
    if (!groupId || !characterId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [charData, groupData] = await Promise.all([
          charactersAPI.getCharacter(Number(groupId), Number(characterId)),
          groupAPI.getGroup(Number(groupId)),
        ]);
        setCharacter(charData);
        setGroup(groupData);
        visitCharacter(Number(groupId), Number(characterId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load character');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, characterId]);

  const characterTabs: TabItem[] = [
    { id: 'resources', label: 'Главная', path: 'resources' },
    { id: 'stats', label: 'Статы', path: 'stats' },
    { id: 'items', label: 'Инвентарь', path: 'items' },
    { id: 'skills', label: 'Способности', path: 'skills' },
    // { id: 'notes', label: 'Заметки', path: 'notes' },
  ];

  const dashboardSettings = useDashboardSettings(Number(groupId), Number(characterId));

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!character || !group) return <div>Персонаж не найден</div>;

  return (
    <>
    <PageLayout
      breadcrumbs={[
        { label: 'Главная', path: '/dashboard' },
        { label: 'Группы', path: '/groups' },
        { label: group.name, path: `/group/${groupId}` },
        { label: character.name },
      ]}
      header={
        <PageHeader
          title={character.name}
          subtitle={character.description}
        />
      }
      tabs={characterTabs}
      tabBasePath={`/group/${groupId}/character/${characterId}`}
      tabOrientation={isMobile ? 'bottom' : 'top'}
    >
      <DashboardSettingsProvider value={dashboardSettings as DashboardSettingsContextType}>
        <Outlet />
      </DashboardSettingsProvider>
    </PageLayout>
    <ActionLogSidebar groupId={Number(groupId)} characterId={Number(characterId)} />
    </>
  );
};

export default CharacterLayout;
