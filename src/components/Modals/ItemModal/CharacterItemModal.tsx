import React, { useState, useEffect } from 'react';
import { CharacterItem, CreateCharacterItemRequest, UpdateCharacterItemRequest } from '../../../types/characterItems';
import { GroupItem } from '../../../types/groupItems';
import buttonStyles from '../../../styles/components/Button.module.css';
import inputStyles from '../../../styles/components/Input.module.css';
import styles from './CharacterItemModal.module.css';

interface CharacterItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: CreateCharacterItemRequest | UpdateCharacterItemRequest) => Promise<void>;
  editingItem?: CharacterItem | null;
  title: string;
  groupItems: GroupItem[];
}

const CharacterItemModal: React.FC<CharacterItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  title,
  groupItems
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>(1);
  const [price, setPrice] = useState<number | ''>(0);
  const [imageLink, setImageLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creationMode, setCreationMode] = useState<'new' | 'existing'>('existing');
  const [selectedGroupItem, setSelectedGroupItem] = useState<GroupItem | null>(null);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description);
      setAmount(editingItem.amount);
      setPrice(editingItem.price);
      setImageLink(editingItem.image_link || '');
      setCreationMode('existing'); 
    } else {
      setName('');
      setDescription('');
      setAmount(1);
      setPrice(0);
      setImageLink('');
      setCreationMode('existing'); 
      setSelectedGroupItem(null);
    }
  }, [editingItem, isOpen]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '') {
        setPrice('');
      } else {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          setPrice(numValue);
        }
      }
    };
  
  const handlePriceBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setPrice(0);
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        setPrice(numValue);
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setAmount('');
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        setAmount(numValue);
      }
    }
  };

const handleAmountBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  if (value === '') {
    setAmount(1);
  } else if (amount !== '' && amount < 0) {
    setAmount(0)
  } else {
    
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setAmount(numValue);
    }
  }
};

  // Обработчик выбора предмета из группы
  const handleGroupItemSelect = (item: GroupItem) => {
    setSelectedGroupItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price);
    setImageLink(item.image_link || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const itemData = {
        id: selectedGroupItem?.id ?? 0,
        name,
        description,
        amount: amount === '' ? 1 : amount < 0 ? 0 : amount,
        price: price === '' ? 0 : price,
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
        <form onSubmit={handleSubmit}>
          
          {creationMode === 'new' && (
          <>
            <div className={styles.formGroup}>
              <label>Название:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputStyles.input}
                required
                disabled={editingItem ? true : false}
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
                disabled={editingItem ? true : false}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Цена за единицу:</label>
              <input
                type="number"
                value={price}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                className={inputStyles.input}
                required
                disabled={editingItem ? true : false}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Ссылка на изображение (в разработке):</label>
              <input
                type="text"
                value={imageLink}
                onChange={(e) => setImageLink(e.target.value)}
                className={inputStyles.input}
                disabled={editingItem ? true : false}
              />
            </div>
          </>
          )}

          <div className={styles.formGroup}>
            <label>Количество:</label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              className={inputStyles.input}
              required
              min="0"
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

export default CharacterItemModal;