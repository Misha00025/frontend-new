import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterItem, CreateCharacterItemRequest, UpdateCharacterItemRequest } from '../../types/characterItems';
import { GroupItem } from '../../types/groupItems';
import { characterItemsAPI } from '../../services/api';
import { groupItemsAPI } from '../../services/api';
import CharacterItemModal from '../../components/Modals/ItemModal/CharacterItemModal';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import uiStyles from '../../styles/ui.module.css';
import ItemCard from '../../components/Cards/ItemCard';
import List from '../../components/List/List';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import { usePlatform } from '../../hooks/usePlatform';

const CharacterItems: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const isMobile = usePlatform();
  const [items, setItems] = useState<CharacterItem[]>([]);
  const [groupItems, setGroupItems] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CharacterItem | null>(null);
  const { canEditThisCharacter } = useActionPermissions();

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
      {canEditThisCharacter && (
        <div className={commonStyles.actions}>
          <button 
            className={buttonStyles.button}
            onClick={() => setIsModalOpen(true)}
          >
            Добавить предмет
          </button>
        </div>
      )}
      <div className={commonStyles.list}>
        <h2>Список предметов</h2>
        {items.length === 0 ? (
          <p>Предметов пока нет</p>
        ) : (
          <List layout="grid" gap="small" gridSize={isMobile ? "small" : "large"}>
            {items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={() => handleEditItem(item)}
                onDelete={() => handleDeleteItem(item.id)}
                showAmount={true}
                showActions={canEditThisCharacter}
              />
            ))}
          </List>
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