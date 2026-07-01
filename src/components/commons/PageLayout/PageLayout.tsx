import React from 'react';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';
import TabBar, { TabItem } from './TabBar';
import styles from './PageLayout.module.css';

export interface PageLayoutProps {
  breadcrumbs: BreadcrumbItem[];
  header?: React.ReactNode;
  tabs: TabItem[];
  tabBasePath: string;
  tabOrientation?: 'top' | 'bottom';
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  breadcrumbs,
  header,
  tabs,
  tabBasePath,
  tabOrientation = 'top',
  children,
}) => {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      {header && <div className={styles.pageHeader}>{header}</div>}
      <TabBar
        tabs={tabs}
        basePath={tabBasePath}
        orientation={tabOrientation}
      />
      <div
        className={styles.pageContent}
        style={
          tabOrientation === 'bottom'
            ? { paddingBottom: '5rem' }
            : undefined
        }
      >
        {children}
      </div>
    </>
  );
};

export default PageLayout;
