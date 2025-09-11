import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '../types/group';
import { groupAPI } from '../services/api';
import { useGroup } from '../contexts/GroupContext';
import buttonStyles from '../styles/components/Button.module.css';
import styles from './Groups.module.css';

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSelectedGroup } = useGroup();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const data = await groupAPI.getGroups();
        setGroups(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    navigate('/dashboard'); // Перенаправляем на главную страницу
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;
  if (error) return <div className={styles.container}>Ошибка: {error}</div>;

  return (
    <div className={styles.container}>
      <h1>Мои группы</h1>
      <div className={styles.groupsList}>
        {groups.map(group => (
          <div key={group.id} className={styles.groupCard}>
            {group.icon && (
              <img src={group.icon} alt={group.name} className={styles.groupIcon} />
            )}
            <h3>{group.name}</h3>
            <button 
              className={buttonStyles.button}
              onClick={() => handleSelectGroup(group)}
            >
              Выбрать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Groups;