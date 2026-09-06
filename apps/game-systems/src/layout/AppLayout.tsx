import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GlobalSidebar from '@tdn/shared/ui/GlobalSidebar/GlobalSidebar';
import PageLayout from '@tdn/shared/ui/PageLayout/PageLayout';
import PageHeader from '@tdn/shared/ui/PageLayout/PageHeader';
import type { TabItem } from '@tdn/shared/ui/PageLayout/TabBar';
import { navItems } from '../navigation';

// Общий layout для авторизованных разделов «Игровых систем».
// Использует GlobalSidebar (с навигацией приложения) + PageLayout из @tdn/shared.
const AppLayout: React.FC = () => {
  const location = useLocation();

  const tabs: TabItem[] = navItems.map((item) => ({
    id: item.id,
    label: item.label,
    path: item.path.replace(/^\//, ''),
  }));

  const current = navItems.find((item) => location.pathname.startsWith(item.path));

  return (
    <div style={{ paddingTop: '60px' }}>
      <GlobalSidebar navItems={navItems} />
      <PageLayout
        breadcrumbs={[{ label: current?.label ?? 'Игровые системы' }]}
        header={<PageHeader title={current?.label ?? 'Игровые системы'} />}
        tabs={tabs}
        tabBasePath=""
      >
        <Outlet />
      </PageLayout>
    </div>
  );
};

export default AppLayout;
