import React from 'react';
import SidebarDrawer from './SidebarDrawer';
import type { NavItem } from '../navigation';

interface GlobalSidebarProps {
  mode?: 'inline' | 'fixed';
  navItems: NavItem[];
}

const GlobalSidebar: React.FC<GlobalSidebarProps> = ({ mode = 'fixed', navItems }) => {
  return <SidebarDrawer inline={mode === 'inline'} navItems={navItems} />;
};

export default GlobalSidebar;
