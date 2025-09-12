import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '../types/group';
import { groupAPI } from '../services/api';
import { useGroup } from '../contexts/GroupContext';
import CreateGroupModal from '../components/Modals/CreateGroupModal/CreateGroupModal';
import GroupCard from '../components/Cards/GroupCard';
import List from '../components/List/List';
import buttonStyles from '../styles/components/Button.module.css';
import commonStyles from '../styles/common.module.css';

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { setSelectedGroup } = useGroup();
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
    setSelectedGroup(null);
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupAPI.getGroups();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    navigate(`/group/${group.id}`);
  };

  const handleGroupCreated = (newGroup: Group) => {
    setGroups(prev => [...prev, newGroup]);
    setSelectedGroup(newGroup);
    navigate(`/group/${newGroup.id}`);
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;
  if (error) return <div className={commonStyles.container}>Ошибка: {error}</div>;

  return (
    <div className={commonStyles.container}>
      <h1>Мои группы</h1>

      <div className={commonStyles.actions}>
        <button 
          className={buttonStyles.button}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Создать группу
        </button>
      </div>

      <List layout="grid" gap="large">
        {groups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            onSelect={handleSelectGroup}
          />
        ))}
      </List>

      <CreateGroupModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};

export default Groups;