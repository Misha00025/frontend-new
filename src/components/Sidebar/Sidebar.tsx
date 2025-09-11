import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import buttonStyles from '../../styles/components/Button.module.css';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>MyApp</h2>
      </div>
      
      <nav className={styles.nav}>
        <Link 
          to="/dashboard" 
          className={`${styles.link} ${location.pathname === '/dashboard' ? styles.active : ''}`}
        >
          Главная
        </Link>
        <Link 
          to="/profile" 
          className={`${styles.link} ${location.pathname === '/profile' ? styles.active : ''}`}
        >
          Профиль
        </Link>
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