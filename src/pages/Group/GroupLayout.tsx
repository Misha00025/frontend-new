import React, { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { Group } from '../../types/group';
import { groupAPI } from '../../services/api';
import { useGroup } from '../../contexts/GroupContext';
import { useVisited } from '../../contexts/VisitedContext';
import { usePlatform } from '../../hooks/usePlatform';
import { usePermissions } from '../../contexts/PermissionsContext';
import PageLayout from '../../components/commons/PageLayout/PageLayout';
import PageHeader from '../../components/commons/PageLayout/PageHeader';
import { TabItem } from '../../components/commons/PageLayout/TabBar';

const GroupLayout: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { selectedGroup, setSelectedGroup } = useGroup();
  const { isGroupAdmin } = usePermissions();
  const { visitGroup } = useVisited();
  const isMobile = usePlatform();
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (!groupId) return;
    if (!selectedGroup || selectedGroup.id !== parseInt(groupId)) {
      groupAPI.getGroup(parseInt(groupId)).then(data => {
        setGroup(data);
        setSelectedGroup(data);
        visitGroup(data.id);
      });
    } else {
      setGroup(selectedGroup);
      visitGroup(selectedGroup.id);
    }
  }, [groupId]);

  const groupTabs: TabItem[] = [
    { id: 'characters', label: 'Персонажи', path: 'characters' },
    { id: 'items', label: 'Предметы', path: 'items' },
    { id: 'skills', label: 'Книга способностей', path: 'skills' },
    ...(isGroupAdmin ? [{ id: 'settings', label: 'Настройки', path: 'settings' }] : []),
  ];

  if (!group) return <div>Загрузка...</div>;

  return (
    <PageLayout
      breadcrumbs={[
        { label: 'Главная', path: '/dashboard' },
        { label: 'Группы', path: '/groups' },
        { label: group.name },
      ]}
      header={
        <PageHeader
          title={group.name}
          subtitle={group.description}
          imageUrl={group.icon ?? undefined}
          imageAlt={group.name}
        />
      }
      tabs={groupTabs}
      tabBasePath={`/group/${groupId}`}
      tabOrientation={isMobile ? 'bottom' : 'top'}
    >
      <Outlet />
    </PageLayout>
  );
};

export default GroupLayout;
