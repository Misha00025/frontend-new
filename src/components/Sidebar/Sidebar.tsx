import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGroup } from '../../contexts/GroupContext';
import { getNavigationItems } from '../../config/navigation';
import buttonStyles from '../../styles/components/Button.module.css';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { selectedGroup } = useGroup();
  const location = useLocation();
  
  // Извлекаем параметры из пути вручную
  const pathParts = location.pathname.split('/').filter(part => part !== '');
  let groupId: string | undefined;
  let characterId: string | undefined;
  
  // Ищем groupId и characterId в пути
  const groupIndex = pathParts.indexOf('group');
  if (groupIndex !== -1 && pathParts.length > groupIndex + 1) {
    groupId = pathParts[groupIndex + 1];
    
    // Проверяем, есть ли characterId
    const characterIndex = pathParts.indexOf('character');
    if (characterIndex !== -1 && pathParts.length > characterIndex + 1) {
      characterId = pathParts[characterIndex + 1];
    }
  }
  
  // Определяем контекст навигации
  let navigationContext: 'default' | 'group' | 'character' = 'default';
  
  if (characterId) {
    navigationContext = 'character';
  } else if (selectedGroup || groupId) {
    navigationContext = 'group';
  }
  
  // Получаем ID группы и персонажа
  const finalGroupId = selectedGroup?.id?.toString() || groupId;
  
  // Получаем элементы навигации для текущего контекста
  const navigationItems = getNavigationItems(navigationContext, finalGroupId, characterId);

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
            className={`${styles.link} ${location.pathname === item.path ? styles.active : ''}`}
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