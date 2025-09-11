import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Group } from '../types/group';
import { groupAPI } from '../services/api';
import { useGroup } from '../contexts/GroupContext';
import buttonStyles from '../styles/components/Button.module.css';
import styles from './GroupDashboard.module.css';

const GroupDashboard: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { setSelectedGroup } = useGroup();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      {group && (
        <div>
          <div className={styles.groupHeader}>
            {group.icon && (
              <img src={group.icon} alt={group.name} className={styles.groupIconLarge} />
            )}
            <h1>{group.name}</h1>
          </div>
          <div className={styles.groupInfo}>
            <p>Здесь будет информация о группе, список участников и другие детали.</p>
            {/* В будущем здесь можно добавить больше информации о группе */}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDashboard;