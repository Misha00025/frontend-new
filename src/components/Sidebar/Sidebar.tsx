import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGroup } from '../../contexts/GroupContext';
import buttonStyles from '../../styles/components/Button.module.css';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { selectedGroup, setSelectedGroup } = useGroup();
  const location = useLocation();

  const handleBack = () => {
    setSelectedGroup(null);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>MyApp</h2>
      </div>
      
      {selectedGroup && (
        <button className={styles.backButton} onClick={handleBack}>
          ← Назад
        </button>
      )}
      
      <nav className={styles.nav}>
        <Link 
          to="/dashboard" 
          className={`${styles.link} ${location.pathname === '/dashboard' ? styles.active : ''}`}
        >
          {selectedGroup ? selectedGroup.name : 'Главная'}
        </Link>
        
        {/* Показываем эти ссылки только когда группа не выбрана */}
        {!selectedGroup && (
          <>
            <Link 
              to="/groups" 
              className={`${styles.link} ${location.pathname === '/groups' ? styles.active : ''}`}
            >
              Группы
            </Link>
            <Link 
              to="/profile" 
              className={`${styles.link} ${location.pathname === '/profile' ? styles.active : ''}`}
            >
              Профиль
            </Link>
          </>
        )}
        
        {/* Здесь в будущем можно добавить ссылки для работы с выбранной группой */}
        {selectedGroup && (
          <>
            {/* Пример будущих ссылок:
            <Link to="/characters" className={styles.link}>Персонажи</Link>
            <Link to="/items" className={styles.link}>Предметы</Link>
            <Link to="/notes" className={styles.link}>Заметки</Link>
            */}
          </>
        )}
      </nav>
      
      <div className={styles.footer}>
        <button className={buttonStyles.button} onClick={logout}>
          Выйти
        </button>
      </div>
    </div>
  );
};

export default Sidebar;