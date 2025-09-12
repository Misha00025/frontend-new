import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterItem, CreateCharacterItemRequest, UpdateCharacterItemRequest } from '../../types/characterItems';
import { GroupItem } from '../../types/groupItems';
import { characterItemsAPI } from '../../services/api';
import { groupItemsAPI } from '../../services/api';
import CharacterItemModal from '../../components/ItemModal/CharacterItemModal';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import uiStyles from '../../styles/ui.module.css';

const CharacterItems: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const [items, setItems] = useState<CharacterItem[]>([]);
  const [groupItems, setGroupItems] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CharacterItem | null>(null);

  useEffect(() => {
    if (groupId && characterId) {
      loadItems();
      loadGroupItems();
    }
  }, [groupId, characterId]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const itemsData = await characterItemsAPI.getCharacterItems(parseInt(groupId!), parseInt(characterId!));
      setItems(itemsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupItems = async () => {
    try {
      const itemsData = await groupItemsAPI.getItems(parseInt(groupId!));
      setGroupItems(itemsData);
    } catch (err) {
      console.error('Failed to load group items:', err);
    }
  };

  const handleCreateItem = async (itemData: CreateCharacterItemRequest) => {
    await characterItemsAPI.createCharacterItem(parseInt(groupId!), parseInt(characterId!), itemData);
    loadItems();
  };

  const handleUpdateItem = async (itemData: UpdateCharacterItemRequest) => {
    if (!editingItem) return;
    await characterItemsAPI.updateCharacterItem(parseInt(groupId!), parseInt(characterId!), editingItem.id, itemData);
    loadItems();
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот предмет?')) return;

    try {
      await characterItemsAPI.deleteCharacterItem(parseInt(groupId!), parseInt(characterId!), itemId);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const handleEditItem = (item: CharacterItem) => {
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
      <h1>Предметы персонажа</h1>

      {error && <div className={commonStyles.error}>{error}</div>}

      <div className={commonStyles.actions}>
        <button 
          className={buttonStyles.button}
          onClick={() => setIsModalOpen(true)}
        >
          Добавить предмет
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
                <p className={uiStyles.itemAmount}>Количество: {item.amount}</p>
                <p className={uiStyles.itemPrice}>Цена за единицу: {item.price}</p>
                <p className={uiStyles.itemTotalPrice}>Общая стоимость: {item.amount * item.price}</p>
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

      <CharacterItemModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingItem ? handleUpdateItem : handleCreateItem}
        editingItem={editingItem}
        title={editingItem ? 'Редактирование предмета' : 'Добавление предмета'}
        groupItems={groupItems}
      />
    </div>
  );
};

export default CharacterItems;