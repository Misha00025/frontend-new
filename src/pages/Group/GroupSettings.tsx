import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Group } from '../../types/group';
import { useGroup } from '../../contexts/GroupContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import styles from '../../styles/common.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import GroupEditModal from '../../components/Modals/CreateGroupModal/EditGroupModal';
import List from '../../components/List/List';
import { usePlatform } from '../../hooks/usePlatform';

const GroupSettings: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { selectedGroup, setSelectedGroup } = useGroup();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isGroupAdmin } = usePermissions();
  const isMobile = usePlatform();

  const handleGroupUpdated = (updatedGroup: Group) => {
    setSelectedGroup(updatedGroup);
  };

  if (!selectedGroup) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h2>Управление</h2>
      <div className={isMobile ? styles.footer : ''}>
        <List>
          {isGroupAdmin && (
            <button
              className={`${buttonStyles.button} ${styles.link}`}
              onClick={() => setIsEditModalOpen(true)}
            >
              Редактировать группу
            </button>
          )}
          <Link
            to={`/group/${groupId}/users`}
            className={`${styles.link}`}
          >
            Пользователи
          </Link>
          <Link
            to={`/group/${groupId}/templates`}
            className={`${styles.link}`}
          >
            Шаблоны
          </Link>
        </List>
      </div>

      {selectedGroup && isGroupAdmin && (
        <GroupEditModal
          group={selectedGroup}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onGroupUpdated={handleGroupUpdated}
        />
      )}
    </div>
  );
};

export default GroupSettings;
