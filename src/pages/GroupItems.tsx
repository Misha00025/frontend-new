import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GroupItem, CreateGroupItemRequest, UpdateGroupItemRequest } from '../types/groupItems';
import { groupItemsAPI } from '../services/api';
import GroupItemModal from '../components/GroupItemModal/GroupItemModal';
import buttonStyles from '../styles/components/Button.module.css';
import commonStyles from '../styles/common.module.css';
import uiStyles from '../styles/ui.module.css';

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

  const handleCreateItem = async (itemData: CreateGroupItemRequest) => {
    await groupItemsAPI.createItem(parseInt(groupId!), itemData);
    loadItems();
  };

  const handleUpdateItem = async (itemData: UpdateGroupItemRequest) => {
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

      <div className={commonStyles.list}>
        <h2>Список предметов</h2>
        {items.length === 0 ? (
          <p>Предметов пока нет</p>
        ) : (
          items.map(item => (
            <div key={item.id} className={uiStyles.itemCard}>
              {item.image_link && (
                <img src={item.image_link} alt={item.name} className={uiStyles.itemImage} />
              )}
              <div className={uiStyles.itemInfo}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p className={uiStyles.itemPrice}>Цена: {item.price}</p>
              </div>
              <div className={uiStyles.itemActions}>
                <button 
                  onClick={() => handleEditItem(item)}
                  className={buttonStyles.button}
                >
                  Редактировать
                </button>
                <button 
                  onClick={() => handleDeleteItem(item.id)}
                  className={buttonStyles.button}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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