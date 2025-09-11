import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGroup } from '../../contexts/GroupContext';
import { getNavigationItems } from '../../config/navigation';
import buttonStyles from '../../styles/components/Button.module.css';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { selectedGroup } = useGroup();
  const { groupId } = useParams<{ groupId: string }>();
  
  // Определяем контекст навигации
  const navigationContext = selectedGroup || groupId ? 'group' : 'default';
  
  // Приводим ID группы к строке для использования в навигации
  const groupIdForNavigation = selectedGroup?.id?.toString() || groupId;
  const navigationItems = getNavigationItems(navigationContext, groupIdForNavigation);

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>MyApp</h2>
      </div>
      
      <nav className={styles.nav}>
        {navigationItems.map(item => (
          <Link
            key={item.id}
            to={item.path}
            className={styles.link}
          >
            <span className={styles.icon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
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