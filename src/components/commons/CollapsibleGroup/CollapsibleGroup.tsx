// src/components/common/CollapsibleGroup/CollapsibleGroup.tsx
import React, { useState } from 'react';
import List from '../../../components/List/List';
import styles from './CollapsibleGroup.module.css';

interface Group<T> {
  id: string;
  name: string;
  items: T[];
}

interface CollapsibleGroupProps<T> {
  group: Group<T>;
  isMobile: boolean;
  ItemComponent: React.ComponentType<{
    item: T;
    onEdit?: (item: T) => void;
    onDelete?: (id: number) => void;
    showActions?: boolean;
  }>;
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
  defaultCollapsed?: boolean;
}

const CollapsibleGroup = <T extends { id: number }>({
  group,
  isMobile,
  ItemComponent,
  onEdit,
  onDelete,
  showActions,
  defaultCollapsed = false,
}: CollapsibleGroupProps<T>) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={styles.container}>
      <div 
        className={styles.header}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className={`${styles.caret} ${isCollapsed ? styles.caretCollapsed : ''}`}>
          ▼
        </span>
        <span className={styles.groupName}>
          {group.name} ({group.items.length})
        </span>
      </div>

      {!isCollapsed && group.items.length > 0 && (
        <div className={styles.content}>
          <List 
            layout={isMobile ? "vertical" : "start-grid"} 
            gap="medium" 
            gridSize='large'
          >
            {group.items.map((item: T) => (
              <ItemComponent
                key={item.id}
                item={item}
                onEdit={showActions && onEdit ? () => onEdit(item) : undefined}
                onDelete={showActions && onDelete ? () => onDelete(item.id) : undefined}
                showActions={showActions}
              />
            ))}
          </List>
        </div>
      )}
    </div>
  );
};

export default CollapsibleGroup;