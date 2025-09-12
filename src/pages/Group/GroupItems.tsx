import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GroupItem } from '../../types/groupItems';
import { groupItemsAPI } from '../../services/api';
import GroupItemModal from '../../components/ItemModal/GroupItemModal';
import ItemCard from '../../components/Cards/ItemCard';
import List from '../../components/List/List';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';

const GroupItems: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [items, setItems] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroupItem | null>(null);

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

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <h1>Предметы группы</h1>

      {error && <div className={commonStyles.error}>{error}</div>}

      <div className={commonStyles.actions}>
        <button 
          className={buttonStyles.button}
          onClick={() => setIsModalOpen(true)}
        >
          Создать предмет
        </button>
      </div>

      <List layout="grid" gap="small">
        {items.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onEdit={() => handleEditItem(item)}
            onDelete={() => handleDeleteItem(item.id)}
          />
        ))}
      </List>

      <GroupItemModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingItem ? handleUpdateItem : handleCreateItem}
        editingItem={editingItem}
        title={editingItem ? 'Редактирование предмета' : 'Создание предмета'}
      />
    </div>
  );
};

export default GroupItems;