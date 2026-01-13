// src/components/common/CollapsibleGroup/CollapsibleGroup.tsx
import React, { useState } from 'react';
import List from '../../../components/List/List';
import styles from './CollapsibleGroup.module.css';

interface Group<T> {
  id: string;
  name: string;
  items: T[];
  children: Group<T>[];
}

interface CollapsibleGroupProps<T> {
  group: Group<T>;
  level: number;
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
  level,
  isMobile,
  ItemComponent,
  onEdit,
  onDelete,
  showActions,
  defaultCollapsed = false,
}: CollapsibleGroupProps<T>) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  
  // Вычисляем общее количество элементов в группе (включая подгруппы)
  const calculateTotalItems = (g: Group<T>): number => {
    let total = g.items.length;
    g.children.forEach(child => {
      total += calculateTotalItems(child);
    });
    return total;
  };
  
  const totalItems = calculateTotalItems(group);
  
  return (
    <div className={styles.container}>
      <div 
        className={styles.header}
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ 
          paddingLeft: `${level * 20}px`,
        }}
      >
        <span className={`${styles.caret} ${isCollapsed ? styles.caretCollapsed : ''}`}>
          ▼
        </span>
        <span className={`${styles.groupName} ${level === 0 ? styles.rootGroupName : ''}`}>
          {group.name} ({totalItems})
        </span>
      </div>

      {!isCollapsed && (
        <div className={styles.content}>
          {/* Элементы текущей группы (если они есть на этом уровне) */}
          {group.items.length > 0 && (
            <div className={styles.itemsContainer}>
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
          
          {/* Рекурсивно рендерим подгруппы */}
          {group.children.map((childGroup) => (
            <CollapsibleGroup
              key={childGroup.id}
              group={childGroup}
              level={level + 1}
              isMobile={isMobile}
              ItemComponent={ItemComponent}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={showActions}
              defaultCollapsed={level > 0} // Подгруппы по умолчанию свернуты
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollapsibleGroup;