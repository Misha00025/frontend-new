import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Group } from '../../types/group';
import { groupAPI } from '../../services/api';
import { useGroup } from '../../contexts/GroupContext';
import styles from '../../styles/common.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import GroupEditModal from '../../components/Modals/CreateGroupModal/EditGroupModal';
import { usePermissions } from '../../contexts/PermissionsContext';

const GroupDashboard: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { setSelectedGroup } = useGroup();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const { isGroupAdmin } = usePermissions();

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;
      
      try {
        const groupData = await groupAPI.getGroup(parseInt(groupId));
        setGroup(groupData);
        setSelectedGroup(groupData);
      } catch (error) {
        console.error('Failed to fetch group:', error);
        navigate('/groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, navigate, setSelectedGroup]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleGroupUpdated = (updatedGroup: Group) => {
    setGroup(updatedGroup);
    setSelectedGroup(updatedGroup);
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      {group && (
        <div className={styles.profile}>
          {/* Секция аватара группы */}
          <div className={styles.avatarSection}>
            {group.icon ? (
              <img 
                src={group.icon} 
                alt={group.name} 
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                Нет иконки
              </div>
            )}
          </div>

          {/* Информация о группе */}
          <div className={styles.info}>
            <div className={styles.field}>
              <strong>ID группы:</strong> {group.id}
            </div>
            
            <div className={styles.field}>
              <strong>Название:</strong> {group.name}
            </div>

            {group.description && (
              <div className={styles.field}>
                <strong>Описание:</strong> {group.description}
              </div>
            )}
          </div>

          {/* Кнопки управления */}
          <div className={styles.footer}>
            {isGroupAdmin && (
              <button 
                className={buttonStyles.button}
                onClick={() => setIsEditModalOpen(true)}
              >
                Редактировать группу
              </button>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно редактирования */}
      {group && isGroupAdmin && (
        <GroupEditModal
          group={group}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onGroupUpdated={handleGroupUpdated}
        />
      )}
    </div>
  );
};

export default GroupDashboard;