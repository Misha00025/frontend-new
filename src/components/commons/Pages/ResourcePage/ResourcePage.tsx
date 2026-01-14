// src/components/common/ResourcePage/ResourcePage.tsx
import React, { useState, useMemo } from 'react';
import List from '../../../../components/List/List';
import SearchBar from '../../../../components/commons/Search/SearchBar';
import CollapsibleGroup from '../../CollapsibleGroup/CollapsibleGroup';
import buttonStyles from '../../../../styles/components/Button.module.css';
import commonStyles from '../../../../styles/common.module.css';
import styles from './ResourcePage.module.css';
import { usePlatform } from '../../../../hooks/usePlatform';
import { Group, groupByAttributes } from '../../../../utils/groupByAttributes';

export interface ResourcePageConfig<T> {
  ItemComponent: React.ComponentType<{
    item: T;
    onEdit?: (item: T) => void;
    onDelete?: (id: number) => void;
    showActions?: boolean;
  }>;
  
  titles: {
    page: string;
    create?: string;
  };
  
  // Список атрибутов для иерархической группировки
  groupByAttributes?: string[];
}

interface ResourcePageProps<T extends { 
  id: number; 
  name: string; 
  description: string; 
  attributes?: Array<{ name: string; value: string }> 
}> {
  config: ResourcePageConfig<T>;
  items: T[];
  loading: boolean;
  error: string | null;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onCreate: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
}

const ResourcePage = <T extends { 
  id: number; 
  name: string; 
  description: string; 
  attributes?: Array<{ name: string; value: string }> 
}>({
  config,
  items,
  loading,
  error,
  canCreate,
  canEdit,
  canDelete,
  onCreate,
  onEdit,
  onDelete,
}: ResourcePageProps<T>) => {
  const isMobile = usePlatform();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Получаем все уникальные атрибуты из элементов
  const availableAttributes = useMemo(() => {
    const attrs = new Set<string>();
    items.forEach(item => {
      item.attributes?.forEach(attr => {
        attrs.add(attr.name);
      });
    });
    return Array.from(attrs).sort();
  }, [items]);
  
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    
    const term = searchTerm.toLowerCase().trim();
    
    return items.filter(item => {
      if (item.name.toLowerCase().includes(term)) return true;
      if (item.description.toLowerCase().includes(term)) return true;
      
      if (item.attributes && item.attributes.length > 0) {
        return item.attributes.some(attr => 
          attr.name.toLowerCase().includes(term) || 
          attr.value.toLowerCase().includes(term)
        );
      }
      
      return false;
    });
  }, [items, searchTerm]);
  
  const groupedItems = useMemo((): Group<T>[] | null => {
    if (!config.groupByAttributes || config.groupByAttributes.length === 0) {
      return null;
    }
    return groupByAttributes(filteredItems, config.groupByAttributes);
  }, [filteredItems, config.groupByAttributes]);
  
  const handleClearSearch = () => setSearchTerm('');
  
  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;
  
  return (
    <div className={commonStyles.container}>
      {/* Измененный заголовок с кнопкой создания */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{config.titles.page}</h1>
        {canCreate && (
          <button 
            className={`${buttonStyles.button} ${styles.createButton}`}
            onClick={onCreate}
            aria-label={config.titles.create !== undefined ? config.titles.create : "Создать"}
            title={config.titles.create !== undefined ? config.titles.create : "Создать"}
          >
            <span className={styles.plusIcon}>+</span>
            <span className={styles.createText}>{config.titles.create !== undefined ? config.titles.create : "Создать"}</span>
          </button>
        )}
      </div>
      
      {error && <div className={commonStyles.error}>{error}</div>}
      
      <div className={styles.headerControls}>
        <div className={styles.searchContainer}>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Поиск по названию, описанию или атрибуту..."
            onClear={handleClearSearch}
          />
        </div>
      </div>
      
      {groupedItems ? (
        <div className={styles.groupsContainer}>
          {groupedItems.map((group: Group<T>) => (
            <CollapsibleGroup
              key={group.id}
              group={group}
              level={0}
              isMobile={isMobile}
              ItemComponent={config.ItemComponent}
              onEdit={canEdit ? onEdit : undefined}
              onDelete={canDelete ? onDelete : undefined}
              showActions={canEdit || canDelete}
            />
          ))}
          
          {groupedItems.length === 0 && !loading && (
            <div className={commonStyles.noResults}>
              <p>
                {searchTerm 
                  ? `По запросу "${searchTerm}" ничего не найдено` 
                  : 'Нет данных для отображения'}
              </p>
              {searchTerm && (
                <button 
                  className={buttonStyles.button}
                  onClick={handleClearSearch}
                >
                  Очистить поиск
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        // Плоский список (если не заданы атрибуты группировки)
        <List 
          layout={isMobile ? "vertical" : "start-grid"} 
          gap="medium" 
          gridSize='large'
        >
          {filteredItems.map(item => (
            <config.ItemComponent
              key={item.id}
              item={item}
              onEdit={canEdit && onEdit ? () => onEdit(item) : undefined}
              onDelete={canDelete && onDelete ? () => onDelete(item.id) : undefined}
              showActions={canEdit || canDelete}
            />
          ))}
          
          {filteredItems.length === 0 && !loading && (
            <div className={commonStyles.noResults}>
              <p>
                {searchTerm 
                  ? `По запросу "${searchTerm}" ничего не найдено` 
                  : 'Нет данных для отображения'}
              </p>
              {searchTerm && (
                <button 
                  className={buttonStyles.button}
                  onClick={handleClearSearch}
                >
                  Очистить поиск
                </button>
              )}
            </div>
          )}
        </List>
      )}
    </div>
  );
};

export default ResourcePage;