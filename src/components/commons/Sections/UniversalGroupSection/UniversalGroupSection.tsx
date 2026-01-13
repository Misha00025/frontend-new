// src/components/common/UniversalGroupSection/UniversalGroupSection.tsx
import React, { useState } from 'react';
import List from '../../../../components/List/List';
import styles from './UniversalGroupSection.module.css';

interface Group<T> {
  id: string;
  name: string;
  items: T[];
  children: Group<T>[];
}

interface UniversalGroupSectionProps<T> {
  group: Group<T>;
  level: number;
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

const UniversalGroupSection = <T extends { id: number }>({
  group,
  level,
  ItemComponent,
  onEdit,
  onDelete,
  showActions,
  defaultCollapsed = true,
}: UniversalGroupSectionProps<T>) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  
  const totalItemsCount = group.items.length + 
    group.children.reduce((acc, child) => acc + child.items.length, 0);
  
  return (
    <div className={`${styles.container} ${level === 0 ? styles.rootGroup : ''}`}>
      <div 
        className={styles.header}
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ 
          paddingLeft: `${level * 20 + 10}px`,
          borderLeft: level > 0 ? `3px solid var(--border-color)` : 'none',
        }}
      >
        <span className={styles.caret}>
          {isCollapsed ? '▶' : '▼'}
        </span>
        
        <span className={styles.groupName}>
          {group.name}
        </span>
        
        <span className={styles.itemsCount}>
          ({totalItemsCount})
        </span>
      </div>

      {!isCollapsed && (
        <div className={styles.content}>
          {/* Элементы в текущей группе */}
          {group.items.length > 0 && (
            <div className={styles.itemsContainer}>
              <List layout="start-grid" gap="medium" gridSize='large'>
                {group.items.map(item => (
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

          {/* Вложенные группы */}
          {group.children.map(childGroup => (
            <UniversalGroupSection
              key={childGroup.id}
              group={childGroup}
              level={level + 1}
              ItemComponent={ItemComponent}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={showActions}
              defaultCollapsed={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversalGroupSection;