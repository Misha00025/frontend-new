// src/components/common/ResourcePage/ResourcePage.tsx
import React, { useState, useMemo } from 'react';
import List from '../../../../components/List/List';
import SearchBar from '../../../../components/commons/Search/SearchBar';
import buttonStyles from '../../../../styles/components/Button.module.css';
import commonStyles from '../../../../styles/common.module.css';
import styles from './ResourcePage.module.css';
import { usePlatform } from '../../../../hooks/usePlatform';
import UniversalGroupSection from '../../Sections/UniversalGroupSection/UniversalGroupSection';

export interface Group<T> {
  id: string;
  name: string;
  items: T[];
  children: Group<T>[];
}

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
  
  groupItems?: (items: T[]) => Group<T>[];
  
  GroupComponent?: React.ComponentType<{
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
  }>;
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
  const [showGrouped, setShowGrouped] = useState(false);
  
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
  
  const groupedItems = useMemo(() => {
    if (!config.groupItems || !showGrouped) return null;
    return config.groupItems(filteredItems);
  }, [filteredItems, config.groupItems, showGrouped]);
  
  const handleClearSearch = () => setSearchTerm('');
  
  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;
  
  return (
    <div className={commonStyles.container}>
      <h1>{config.titles.page}</h1>
      
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
        
        {config.groupItems && (
          <button 
            className={buttonStyles.button}
            onClick={() => setShowGrouped(!showGrouped)}
          >
            {showGrouped ? 'Показать список' : 'Сгруппировать'}
          </button>
        )}
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
      
      {showGrouped && groupedItems ? (
        <div className={styles.groupsContainer}>
          {groupedItems.map(group => {
            const GroupComponentToRender = config.GroupComponent || UniversalGroupSection;
            
            return (
              <GroupComponentToRender
                key={group.id}
                group={group}
                level={0}
                ItemComponent={config.ItemComponent}
                onEdit={canEdit ? onEdit : undefined}
                onDelete={canDelete ? onDelete : undefined}
                showActions={canEdit || canDelete}
              />
            );
          })}
        </div>
      ) : (
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