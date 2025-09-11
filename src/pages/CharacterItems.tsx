import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterItem, CreateCharacterItemRequest } from '../types/characterItems';
import { GroupItem } from '../types/groupItems';
import { characterItemsAPI } from '../services/api';
import { groupItemsAPI } from '../services/api';
import buttonStyles from '../styles/components/Button.module.css';
import inputStyles from '../styles/components/Input.module.css';
import styles from './CharacterItems.module.css';

const CharacterItems: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const [items, setItems] = useState<CharacterItem[]>([]);
  const [groupItems, setGroupItems] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CharacterItem | null>(null);
  const [creationMode, setCreationMode] = useState<'new' | 'existing'>('new');
  const [selectedGroupItem, setSelectedGroupItem] = useState<GroupItem | null>(null);

  const [formData, setFormData] = useState<CreateCharacterItemRequest>({
    name: '',
    description: '',
    amount: 1,
    price: 0,
    image_link: '',
  });

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

  const handleCreateItem = async () => {
    try {
      await characterItemsAPI.createCharacterItem(parseInt(groupId!), parseInt(characterId!), formData);
      setShowCreateForm(false);
      setFormData({ name: '', description: '', amount: 1, price: 0, image_link: '' });
      setSelectedGroupItem(null);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      await characterItemsAPI.updateCharacterItem(parseInt(groupId!), parseInt(characterId!), editingItem.id, formData);
      setEditingItem(null);
      setFormData({ name: '', description: '', amount: 1, price: 0, image_link: '' });
      setSelectedGroupItem(null);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
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
    setFormData({
      name: item.name,
      description: item.description,
      amount: item.amount,
      price: item.price,
      image_link: item.image_link || '',
    });
    setCreationMode('new');
    setSelectedGroupItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowCreateForm(false);
    setFormData({ name: '', description: '', amount: 1, price: 0, image_link: '' });
    setSelectedGroupItem(null);
  };

  const handleGroupItemSelect = (item: GroupItem) => {
    setSelectedGroupItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      amount: 1,
      price: item.price,
      image_link: item.image_link || '',
    });
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1>Предметы персонажа</h1>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button 
          className={buttonStyles.button}
          onClick={() => setShowCreateForm(true)}
        >
          Добавить предмет
        </button>
      </div>

      {(showCreateForm || editingItem) && (
        <div className={styles.form}>
          <h2>{editingItem ? 'Редактирование предмета' : 'Добавление предмета'}</h2>
          
          {!editingItem && (
            <div className={styles.formGroup}>
              <label>Способ добавления:</label>
              <div className={styles.radioGroup}>
                <label>
                  <input
                    type="radio"
                    value="new"
                    checked={creationMode === 'new'}
                    onChange={() => setCreationMode('new')}
                  />
                  Создать новый
                </label>
                <label>
                  <input
                    type="radio"
                    value="existing"
                    checked={creationMode === 'existing'}
                    onChange={() => setCreationMode('existing')}
                  />
                  Добавить готовый
                </label>
              </div>
            </div>
          )}

          {creationMode === 'existing' && !editingItem && (
            <div className={styles.formGroup}>
              <label>Выберите предмет из группы:</label>
              <select
                value={selectedGroupItem?.id || ''}
                onChange={(e) => {
                  const item = groupItems.find(item => item.id === parseInt(e.target.value));
                  if (item) handleGroupItemSelect(item);
                }}
                className={inputStyles.input}
              >
                <option value="">Выберите предмет</option>
                {groupItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Название:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputStyles.input}
              disabled={creationMode === 'existing' && !editingItem}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Описание:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputStyles.input}
              rows={3}
              disabled={creationMode === 'existing' && !editingItem}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Количество:</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className={inputStyles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Цена за единицу:</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className={inputStyles.input}
              disabled={creationMode === 'existing' && !editingItem}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Ссылка на изображение (опционально):</label>
            <input
              type="text"
              value={formData.image_link || ''}
              onChange={(e) => setFormData({ ...formData, image_link: e.target.value })}
              className={inputStyles.input}
              disabled={creationMode === 'existing' && !editingItem}
            />
          </div>

          <div className={styles.formActions}>
            <button 
              onClick={editingItem ? handleUpdateItem : handleCreateItem}
              className={buttonStyles.button}
            >
              {editingItem ? 'Сохранить' : 'Добавить'}
            </button>
            <button 
              onClick={handleCancelEdit}
              className={buttonStyles.button}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className={styles.itemsList}>
        <h2>Список предметов</h2>
        {items.length === 0 ? (
          <p>Предметов пока нет</p>
        ) : (
          items.map(item => (
            <div key={item.id} className={styles.itemCard}>
              {item.image_link && (
                <img src={item.image_link} alt={item.name} className={styles.itemImage} />
              )}
              <div className={styles.itemInfo}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p className={styles.itemAmount}>Количество: {item.amount}</p>
                <p className={styles.itemPrice}>Цена за единицу: {item.price}</p>
                <p className={styles.itemTotalPrice}>Общая стоимость: {item.amount * item.price}</p>
              </div>
              <div className={styles.itemActions}>
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
    </div>
  );
};

export default CharacterItems;