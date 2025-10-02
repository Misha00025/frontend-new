import React from 'react';
import MobileSidebar from './MobileSidebar';
import DesktopSidebar from './DesktopSidebar';
import { usePlatform } from '../../../hooks/usePlatform';

const Sidebar: React.FC = () => {
  const isMobile = usePlatform();
  return isMobile ? <MobileSidebar /> : <DesktopSidebar />
};

export default Sidebar;