import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../../contexts/SidebarContext';
import { useAuth } from '../../../hooks/useAuth';
import ThemeToggle from '../Buttons/ThemeToggle/ThemeToggle';
import type { NavItem } from '../../../types/navigation';
import styles from './GlobalSidebar.module.css';

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Главная', icon: '🏠', path: '/dashboard' },
  { id: 'groups', label: 'Группы', icon: '👥', path: '/groups' },
  { id: 'profile', label: 'Профиль', icon: '👤', path: '/profile' },
];

interface SidebarDrawerProps {
  inline?: boolean;
}

const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ inline = false }) => {
  const { isOpen, open, close } = useSidebar();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    close();
  };

  return (
    <>
      <button className={inline ? styles.hamburgerInline : styles.hamburger} onClick={open}>
        ☰
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={close} />
      )}

      <div className={`${styles.drawer} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Меню</span>
          <button className={styles.closeBtn} onClick={close}>✕</button>
        </div>

        <nav className={styles.drawerNav}>
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
              onClick={handleNavClick}
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

export default SidebarDrawer;
