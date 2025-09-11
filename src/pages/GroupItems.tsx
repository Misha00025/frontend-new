import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GroupItem, CreateGroupItemRequest } from '../types/groupItems';
import { groupItemsAPI } from '../services/api';
import buttonStyles from '../styles/components/Button.module.css';
import inputStyles from '../styles/components/Input.module.css';
import styles from './GroupItems.module.css';

const GroupItems: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [items, setItems] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GroupItem | null>(null);

  const [formData, setFormData] = useState<CreateGroupItemRequest>({
    name: '',
    description: '',
    price: 0,
    image_link: '',
  });

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

  const handleCreateItem = async () => {
    try {
      await groupItemsAPI.createItem(parseInt(groupId!), formData);
      setShowCreateForm(false);
      setFormData({ name: '', description: '', price: 0, image_link: '' });
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      await groupItemsAPI.updateItem(parseInt(groupId!), editingItem.id, formData);
      setEditingItem(null);
      setFormData({ name: '', description: '', price: 0, image_link: '' });
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
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
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      image_link: item.image_link || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowCreateForm(false);
    setFormData({ name: '', description: '', price: 0, image_link: '' });
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1>Предметы группы</h1>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button 
          className={buttonStyles.button}
          onClick={() => setShowCreateForm(true)}
        >
          Создать предмет
        </button>
      </div>

      {(showCreateForm || editingItem) && (
        <div className={styles.form}>
          <h2>{editingItem ? 'Редактирование предмета' : 'Создание предмета'}</h2>
          
          <div className={styles.formGroup}>
            <label>Название:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputStyles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Описание:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputStyles.input}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Цена:</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className={inputStyles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Ссылка на изображение (опционально):</label>
            <input
              type="text"
              value={formData.image_link || ''}
              onChange={(e) => setFormData({ ...formData, image_link: e.target.value })}
              className={inputStyles.input}
            />
          </div>

          <div className={styles.formActions}>
            <button 
              onClick={editingItem ? handleUpdateItem : handleCreateItem}
              className={buttonStyles.button}
            >
              {editingItem ? 'Сохранить' : 'Создать'}
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
                <p className={styles.itemPrice}>Цена: {item.price}</p>
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

export default GroupItems;