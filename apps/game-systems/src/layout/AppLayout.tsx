import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PageLayout from '@tdn/shared/ui/PageLayout/PageLayout';
import PageHeader from '@tdn/shared/ui/PageLayout/PageHeader';
import { navItems } from '../navigation';

// Общий layout для авторизованных разделов «Игровых систем».
// Навигация приложения передаётся в PageLayout (который рендерит единственный
// GlobalSidebar mode="inline" с гамбургером) — без дублирования кнопки меню.
const AppLayout: React.FC = () => {
  const location = useLocation();

  const current = navItems.find((item) => location.pathname.startsWith(item.path));

  return (
    <PageLayout
      breadcrumbs={[{ label: current?.label ?? 'Игровые системы' }]}
      header={<PageHeader title={current?.label ?? 'Игровые системы'} />}
      tabs={[]}
      tabBasePath=""
      navItems={navItems}
    >
      <Outlet />
    </PageLayout>
  );
};

export default AppLayout;
