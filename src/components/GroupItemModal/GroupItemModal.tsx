import React, { useState, useEffect } from 'react';
import { GroupItem, CreateGroupItemRequest, UpdateGroupItemRequest } from '../../types/groupItems';
import buttonStyles from '../../styles/components/Button.module.css';
import inputStyles from '../../styles/components/Input.module.css';
import styles from './GroupItemModal.module.css';

interface GroupItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: CreateGroupItemRequest | UpdateGroupItemRequest) => Promise<void>;
  editingItem?: GroupItem | null;
  title: string;
}

const GroupItemModal: React.FC<GroupItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  title
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [imageLink, setImageLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description);
      setPrice(editingItem.price);
      setImageLink(editingItem.image_link || '');
    } else {
      // Сброс формы при создании нового предмета
      setName('');
      setDescription('');
      setPrice(0);
      setImageLink('');
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const itemData = {
        name,
        description,
        price,
        image_link: imageLink || undefined,
      };

      await onSave(itemData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{title}</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Название:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Описание:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputStyles.input}
              rows={3}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Цена:</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className={inputStyles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Ссылка на изображение (опционально):</label>
            <input
              type="text"
              value={imageLink}
              onChange={(e) => setImageLink(e.target.value)}
              className={inputStyles.input}
            />
          </div>

          <div className={styles.buttons}>
            <button type="button" onClick={onClose} className={buttonStyles.button}>
              Отмена
            </button>
            <button type="submit" className={buttonStyles.button} disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupItemModal;