// src/components/common/ResourcePage/ResourcePage.tsx
import React, { useState, useMemo } from 'react';
import List from '../../../../components/List/List';
import SearchBar from '../../../../components/commons/Search/SearchBar';
import buttonStyles from '../../../../styles/components/Button.module.css';
import commonStyles from '../../../../styles/common.module.css';
import { usePlatform } from '../../../../hooks/usePlatform';

export interface ResourcePageConfig<T> {
  // Компонент для отображения элемента
  ItemComponent: React.ComponentType<{
    item: T;
    onEdit?: (item: T) => void;
    onDelete?: (id: number) => void;
    showActions?: boolean;
  }>;
  
  // Тексты
  titles: {
    page: string;
  };
}

interface ResourcePageProps<T extends { id: number; name: string; description: string; attributes?: Array<{ name: string; value: string }> }> {
  config: ResourcePageConfig<T>;
  items: T[];
  loading: boolean;
  error: string | null;
  
  // Разрешения
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  
  // Обработчики действий
  onCreate: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
}

const ResourcePage = <T extends { id: number; name: string; description: string; attributes?: Array<{ name: string; value: string }> }>({
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
  
  // Функция поиска по всем релевантным полям
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    return items.filter(item => {
      // Поиск по имени
      if (item.name.toLowerCase().includes(term)) {
        return true;
      }
      
      // Поиск по описанию
      if (item.description.toLowerCase().includes(term)) {
        return true;
      }
      
      // Поиск по атрибутам (если есть)
      if (item.attributes && item.attributes.length > 0) {
        const hasMatchingAttribute = item.attributes.some(attr => 
          attr.name.toLowerCase().includes(term) || 
          attr.value.toLowerCase().includes(term)
        );
        
        if (hasMatchingAttribute) {
          return true;
        }
      }
      
      return false;
    });
  }, [items, searchTerm]);
  
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;
  
  return (
    <div className={commonStyles.container}>
      <h1>{config.titles.page}</h1>
      
      {error && <div className={commonStyles.error}>{error}</div>}
      
      {/* Панель поиска */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Поиск по названию, описанию или атрибуту..."
        onClear={handleClearSearch}
      />
      
      {/* Кнопка создания */}
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
      
      {/* Список элементов */}
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
    </div>
  );
};

export default ResourcePage;