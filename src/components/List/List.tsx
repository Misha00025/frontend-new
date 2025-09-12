import React from 'react';
import styles from './List.module.css';

interface ListProps {
  children: React.ReactNode;
  layout?: 'vertical' | 'horizontal' | 'grid';
  className?: string;
  gap?: 'small' | 'medium' | 'large';
}

const List: React.FC<ListProps> = ({
  children,
  layout = 'vertical',
  className = '',
  gap = 'medium'
}) => {
  const layoutClass = styles[`layout-${layout}`];
  const gapClass = styles[`gap-${gap}`];
  
  return (
    <div className={`${styles.list} ${layoutClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
};

export default List;