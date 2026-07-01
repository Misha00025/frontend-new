import React from 'react';
import SidebarDrawer from './SidebarDrawer';

interface GlobalSidebarProps {
  mode?: 'inline' | 'fixed';
}

const GlobalSidebar: React.FC<GlobalSidebarProps> = ({ mode = 'fixed' }) => {
  return <SidebarDrawer inline={mode === 'inline'} />;
};

export default GlobalSidebar;
