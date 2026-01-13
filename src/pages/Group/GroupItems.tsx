// GroupItems.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GroupItem } from '../../types/groupItems';
import { groupItemsAPI } from '../../services/api';
import ItemCard from '../../components/Cards/ItemCard/ItemCard';
import GroupItemModal from '../../components/Modals/ItemModal/GroupItemModal';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import ResourcePage from '../../components/commons/Pages/ResourcePage/ResourcePage';

const ItemCardWrapper: React.FC<{
  item: GroupItem;
  onEdit?: (item: GroupItem) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}> = ({ item, onEdit, onDelete, showActions }) => {
  return (
    <ItemCard
      item={item}
      onEdit={onEdit ? () => onEdit(item) : undefined}
      onDelete={onDelete ? () => onDelete(item.id) : undefined}
      showActions={showActions}
    />
  );
};

const GroupItems: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [items, setItems] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroupItem | null>(null);
  const { canEditItems } = useActionPermissions();
  
  useEffect(() => {
    if (groupId) {
      loadItems();
    }
  }, [groupId]);
  
  const loadItems = async () => {
    try {
      setLoading(true);
      const itemsData = await groupItemsAPI.getItems(parseInt(groupId!));
      setItems(itemsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (item: GroupItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (itemId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот предмет?')) return;
    
    try {
      await groupItemsAPI.deleteItem(parseInt(groupId!), itemId);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };
  
  const handleSaveItem = async (itemData: any) => {
    if (editingItem) {
      await groupItemsAPI.updateItem(parseInt(groupId!), editingItem.id, itemData);
    } else {
      await groupItemsAPI.createItem(parseInt(groupId!), itemData);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
    loadItems();
  };
  
  const config = {
    ItemComponent: ItemCardWrapper,
    titles: {
      page: 'Каталог предметов',
    },
    groupByAttribute: 'Тип',
  };
  
  return (
    <>
      <ResourcePage
        config={config}
        items={items}
        loading={loading}
        error={error}
        canCreate={canEditItems}
        canEdit={canEditItems}
        canDelete={canEditItems}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {canEditItems && (
        <GroupItemModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveItem}
          editingItem={editingItem}
          title={editingItem ? 'Редактирование предмета' : 'Создание предмета'}
        />
      )}
    </>
  );
};

export default GroupItems;