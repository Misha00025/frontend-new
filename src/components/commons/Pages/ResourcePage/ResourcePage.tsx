// src/components/common/ResourcePage/ResourcePage.tsx
import React, { useState, useMemo } from 'react';
import List from '../../../../components/List/List';
import SearchBar from '../../../../components/commons/Search/SearchBar';
import CollapsibleGroup from '../../CollapsibleGroup/CollapsibleGroup';
import buttonStyles from '../../../../styles/components/Button.module.css';
import commonStyles from '../../../../styles/common.module.css';
import styles from './ResourcePage.module.css';
import { usePlatform } from '../../../../hooks/usePlatform';
import { Group, groupByAttribute } from '../../../../utils/groupByAttributes';

export interface ResourcePageConfig<T> {
  ItemComponent: React.ComponentType<{
    item: T;
    onEdit?: (item: T) => void;
    onDelete?: (id: number) => void;
    showActions?: boolean;
  }>;
  
  titles: {
    page: string;
  };
  
  // Атрибут для группировки (например, "Тип", "Категория")
  groupByAttribute?: string;
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
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
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
  
  // Группируем по атрибуту, если задан
  const groupedItems = useMemo((): Group<T>[] | null => {
    if (!config.groupByAttribute) return null;
    return groupByAttribute(filteredItems, config.groupByAttribute);
  }, [filteredItems, config.groupByAttribute]);
  
  const handleClearSearch = () => setSearchTerm('');
  
  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;
  
  return (
    <div className={commonStyles.container}>
      <h1>{config.titles.page}</h1>
      
      {error && <div className={commonStyles.error}>{error}</div>}
      
      <div className={styles.headerControls}>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Поиск по названию, описанию или атрибуту..."
          onClear={handleClearSearch}
        />
      </div>
      
      {canCreate && (
        <div className={commonStyles.actions}>
          <button 
            className={buttonStyles.button}
            onClick={onCreate}
          >
            Создать
          </button>
        </div>
      )}
      
      {/* Если задан groupByAttribute, показываем группы, иначе плоский список */}
      {groupedItems ? (
        <div className={styles.groupsContainer}>
          {groupedItems.map((group: Group<T>) => (
            <CollapsibleGroup
              key={group.id}
              group={group}
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
        // Плоский список (если не задан groupByAttribute)
        <List 
          layout={isMobile ? "vertical" : "start-grid"} 
          gap="medium" 
          gridSize='large'
        >
          {filteredItems.map(item => (
            <config.ItemComponent
              key={item.id}
              item={item}
              onEdit={canEdit ? () => onEdit(item) : undefined}
              onDelete={canDelete ? () => onDelete(item.id) : undefined}
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