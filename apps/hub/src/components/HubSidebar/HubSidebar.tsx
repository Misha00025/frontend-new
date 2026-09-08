// Общая левая панель хаба.
//
// Сверху вниз: Главная, Игровые системы, Группы, Профиль;
// внизу — Настройки и Выход. Использует общий SidebarProvider из @tdn/shared
// (состояние открыто/закрыто) и useAuth для выхода.

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar, useAuth, ThemeToggle } from '@tdn/shared';
import { hubNavItems } from '../../navigation';
import styles from './HubSidebar.module.css';

const HubSidebar: React.FC = () => {
  const { isOpen, open, close } = useSidebar();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <button className={styles.hamburger} onClick={open} aria-label="Открыть меню">
        ☰
      </button>

      {isOpen && <div className={styles.overlay} onClick={close} />}

      <div className={`${styles.drawer} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Меню</span>
          <button className={styles.closeBtn} onClick={close}>✕</button>
        </div>

        <nav className={styles.drawerNav}>
          {hubNavItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
              onClick={close}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.drawerFooter}>
          <div className={styles.footerRow}>
            <button className={styles.footerBtn} onClick={handleLogout}>
              <span className={styles.icon}>🚪</span>
              <span className={styles.label}>Выйти</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
};

export default HubSidebar;
