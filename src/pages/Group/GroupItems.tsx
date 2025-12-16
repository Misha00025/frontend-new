import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { GroupItem } from '../../types/groupItems';
import { groupItemsAPI } from '../../services/api';
import GroupItemModal from '../../components/Modals/ItemModal/GroupItemModal';
import ItemCard from '../../components/Cards/ItemCard/ItemCard';
import List from '../../components/List/List';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import { usePlatform } from '../../hooks/usePlatform';
import SearchBar from '../../components/commons/Search/SearchBar';

const GroupItems: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const isMobile = usePlatform();
  const [items, setItems] = useState<GroupItem[]>([]);
  const [allItems, setAllItems] = useState<GroupItem[]>([]); // Все предметы без фильтрации
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroupItem | null>(null);
  const { canEditItems } = useActionPermissions();
  
  // Состояния для поиска и фильтрации
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('');
  const [attributeValue, setAttributeValue] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  useEffect(() => {
    if (groupId) {
      loadItems();
    }
  }, [groupId]);

  // Фильтрация предметов
  useEffect(() => {
    if (!allItems.length) return;

    let filtered = [...allItems];

    // Поиск по тексту
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.attributes?.some(attr => 
          attr.name.toLowerCase().includes(term) ||
          attr.value.toLowerCase().includes(term)
        )
      );
    }

    // Фильтрация по атрибуту
    if (selectedAttribute) {
      filtered = filtered.filter(item =>
        item.attributes?.some(attr => {
          if (attributeValue) {
            return attr.name === selectedAttribute && attr.value === attributeValue;
          }
          return attr.name === selectedAttribute;
        })
      );
    }

    // Фильтрация по цене
    if (priceRange.min !== '') {
      const min = parseFloat(priceRange.min);
      if (!isNaN(min)) {
        filtered = filtered.filter(item => item.price >= min);
      }
    }
    
    if (priceRange.max !== '') {
      const max = parseFloat(priceRange.max);
      if (!isNaN(max)) {
        filtered = filtered.filter(item => item.price <= max);
      }
    }

    setItems(filtered);
  }, [allItems, searchTerm, selectedAttribute, attributeValue, priceRange]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const itemsData = await groupItemsAPI.getItems(parseInt(groupId!));
      setAllItems(itemsData);
      setItems(itemsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // Получение уникальных атрибутов для фильтрации
  const availableAttributes = useMemo(() => {
    const attrs = new Set<string>();
    allItems.forEach(item => {
      item.attributes?.forEach(attr => {
        attrs.add(attr.name);
      });
    });
    return Array.from(attrs);
  }, [allItems]);

  // Получение возможных значений для выбранного атрибута
  const attributeValues = useMemo(() => {
    if (!selectedAttribute) return [];
    const values = new Set<string>();
    allItems.forEach(item => {
      item.attributes?.forEach(attr => {
        if (attr.name === selectedAttribute) {
          values.add(attr.value);
        }
      });
    });
    return Array.from(values).sort();
  }, [allItems, selectedAttribute]);

  const handleCreateItem = async (itemData: any) => {
    await groupItemsAPI.createItem(parseInt(groupId!), itemData);
    loadItems();
  };

  const handleUpdateItem = async (itemData: any) => {
    if (!editingItem) return;
    await groupItemsAPI.updateItem(parseInt(groupId!), editingItem.id, itemData);
    loadItems();
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот предмет?')) return;

    try {
      await groupItemsAPI.deleteItem(parseInt(groupId!), itemId);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const handleEditItem = (item: GroupItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedAttribute('');
    setAttributeValue('');
    setPriceRange({ min: '', max: '' });
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <h1>Каталог предметов</h1>

      {error && <div className={commonStyles.error}>{error}</div>}

      {/* Панель поиска и фильтрации */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedAttribute={selectedAttribute}
        onAttributeChange={(attr) => {
          setSelectedAttribute(attr);
          setAttributeValue(''); // Сбрасываем значение при смене атрибута
        }}
        attributeValue={attributeValue}
        onAttributeValueChange={setAttributeValue}
        availableAttributes={availableAttributes}
        attributeValues={attributeValues}
        onClearFilters={handleClearFilters}
        resultsCount={items.length}
        totalCount={allItems.length}
        placeholder="Поиск по названию, описанию или атрибуту..."
        attributeLabel="Атрибут"
        valueLabel="Значение"
        showPriceFilter={true}
        priceRange={priceRange}
        onPriceRangeChange={handlePriceRangeChange}
      />

      {canEditItems && (
        <div className={commonStyles.actions}>
          <button 
            className={buttonStyles.button}
            onClick={() => setIsModalOpen(true)}
          >
            Создать предмет
          </button>
        </div>
      )}

      <List layout={isMobile ? "vertical" : "start-grid"} gap="medium" gridSize='large'>
        {items.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onEdit={canEditItems ? () => handleEditItem(item) : undefined}
            onDelete={canEditItems ? () => handleDeleteItem(item.id) : undefined}
            showActions={canEditItems}
          />
        ))}
        {items.length === 0 && !loading && (
          <div className={commonStyles.noResults}>
            <p>По вашему запросу ничего не найдено</p>
            <button 
              className={buttonStyles.button}
              onClick={handleClearFilters}
            >
              Очистить фильтры
            </button>
          </div>
        )}
      </List>

      {canEditItems && (
        <GroupItemModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={editingItem ? handleUpdateItem : handleCreateItem}
          editingItem={editingItem}
          title={editingItem ? 'Редактирование предмета' : 'Создание предмета'}
        />
      )}
    </div>
  );
};

export default GroupItems;