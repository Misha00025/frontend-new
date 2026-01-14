import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterItem, CreateCharacterItemRequest, UpdateCharacterItemRequest } from '../../types/characterItems';
import { GroupItem } from '../../types/groupItems';
import { characterItemsAPI, groupAPI } from '../../services/api';
import { groupItemsAPI } from '../../services/api';
import CharacterItemModal from '../../components/Modals/ItemModal/CharacterItemModal';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import uiStyles from '../../styles/ui.module.css';
import ItemCard from '../../components/Cards/ItemCard/ItemCard';
import List from '../../components/List/List';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import { usePlatform } from '../../hooks/usePlatform';
import ResourcePage from '../../components/commons/Pages/ResourcePage/ResourcePage';
import { create } from 'domain';

const ItemCardWrapper: React.FC<{
  item: CharacterItem;
  onEdit?: (item: CharacterItem) => void;
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

const CharacterItems: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const isMobile = usePlatform();
  const [items, setItems] = useState<CharacterItem[]>([]);
  const [groupItems, setGroupItems] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<string[]>([]); // Добавлено состояние для схемы
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CharacterItem | null>(null);
  const { canEditThisCharacter } = useActionPermissions();

  useEffect(() => {
    if (groupId && characterId) {
      loadSchema();
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

  const loadSchema = async () => {
      try {
        const schemaData = await groupAPI.getItemsSchema(parseInt(groupId!));
        setSchema(schemaData.groupBy);
      } catch (err) {
        console.error('Failed to load schema:', err);
        // При ошибке используем пустую схему
        setSchema([]);
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
    if (itemData.id){
      await characterItemsAPI.updateCharacterItem(parseInt(groupId!), parseInt(characterId!), itemData.id, itemData)
    }
    else{
      await characterItemsAPI.createCharacterItem(parseInt(groupId!), parseInt(characterId!), itemData);
    }
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

  const config = {
    ItemComponent: ItemCardWrapper,
    titles: {
      page: 'Инвентарь',
      create: 'Добавить'
    },
    groupByAttributes: schema,
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <>
      <ResourcePage
        config={config}
        items={items}
        loading={loading}
        error={error}
        canCreate={canEditThisCharacter}
        canEdit={canEditThisCharacter}
        canDelete={canEditThisCharacter}
        onCreate={() => setIsModalOpen(true)}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />
      
      {canEditThisCharacter && (
        <CharacterItemModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={editingItem ? handleUpdateItem : handleCreateItem}
          editingItem={editingItem}
          title={editingItem ? 'Редактирование предмета' : 'Добавление предмета'}
          groupItems={groupItems}
        />
      )}
    </>
  );
};

export default CharacterItems;