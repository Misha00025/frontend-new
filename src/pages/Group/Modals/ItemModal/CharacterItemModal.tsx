import React, { useState, useEffect } from 'react';
import { CharacterItem, CreateCharacterItemRequest, UpdateCharacterItemRequest } from '../../../../types/characterItems';
import { GroupItem } from '../../../../types/groupItems';
import buttonStyles from '../../../../styles/components/Button.module.css';
import inputStyles from '../../../../styles/components/Input.module.css';
import modalStyles from '../../../../styles/modal.module.css';
import ModalPortal from '../../../../components/commons/ModalPortal/ModalPortal';
import styles from './CharacterItemModal.module.css';
import uiStyles from '../../../../styles/ui.module.css';
import selectStyles from '../../../../styles/select-list.module.css';
import EvaluatedInput from '../../../../components/commons/EvaluatedInput/EvaluatedInput';

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
  
  // Добавляем состояния для поиска и фильтрации
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<GroupItem[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<string[]>([]);

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
      setSearchTerm('');
      setSelectedAttribute('');
    }
  }, [editingItem, isOpen]);

  // Получаем уникальные атрибуты из всех предметов группы
  useEffect(() => {
    if (isOpen && creationMode === 'existing' && !editingItem) {
      const attributes = new Set<string>();
      groupItems.forEach(item => {
        item.attributes?.forEach(attr => {
          attributes.add(attr.name);
        });
      });
      setAvailableAttributes(Array.from(attributes));
    }
  }, [groupItems, isOpen, creationMode, editingItem]);

  // Фильтрация предметов
  useEffect(() => {
    if (!isOpen || creationMode !== 'existing' || editingItem) return;

    let result = groupItems;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.attributes?.some(attr => 
          attr.name.toLowerCase().includes(term) ||
          attr.value.toLowerCase().includes(term)
        )
      );
    }

    if (selectedAttribute) {
      result = result.filter(item =>
        item.attributes?.some(attr => attr.name === selectedAttribute)
      );
    }

    setFilteredItems(result);
  }, [groupItems, searchTerm, selectedAttribute, isOpen, creationMode, editingItem]);

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

  const getAttributeValue = (item: GroupItem, attributeName: string): string => {
    const attribute = item.attributes?.find(attr => attr.name === attributeName);
    return attribute ? attribute.value : '-';
  };


  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      
        <h2>{title}</h2>
        
        {error && <div className={modalStyles.error}>{error}</div>}
        
        {!editingItem && (
          <div className={modalStyles.formGroup}>
            <label>Способ добавления:</label>
            <div className={uiStyles.radioGroup}>
              <label>
                <input
                  type="radio"
                  value="new"
                  checked={creationMode === 'new'}
                  onChange={() => {
                    setCreationMode('new');
                    setSelectedGroupItem(null);
                    setName('');
                    setDescription('');
                    setPrice(0);
                    setImageLink('');
                  }}
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
          <>
            <div className={selectStyles.filters}>
              <div className={selectStyles.searchGroup}>
                <label>Поиск:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={inputStyles.input}
                  placeholder="Название, описание или атрибут..."
                />
              </div>
              
              <div className={selectStyles.filterGroup}>
                <label>Фильтр по атрибуту:</label>
                <select
                  value={selectedAttribute}
                  onChange={(e) => setSelectedAttribute(e.target.value)}
                  className={inputStyles.input}
                >
                  <option value="">Все атрибуты</option>
                  {availableAttributes.map(attr => (
                    <option key={attr} value={attr}>{attr}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedGroupItem && (
              <div className={styles.selectedItem}>
                <h3>Выбранный предмет:</h3>
                <div className={selectStyles.listItem}>
                  <h4 className={selectStyles.itemName}>{selectedGroupItem.name}</h4>
                  <p className={selectStyles.itemDescription}>{selectedGroupItem.description}</p>
                  <p className={styles.itemPrice}>Цена: {selectedGroupItem.price}</p>
                  {selectedGroupItem.attributes && selectedGroupItem.attributes.length > 0 && (
                    <div className={selectStyles.attributes}>
                      <h5>Атрибуты:</h5>
                      <div className={selectStyles.attributesGrid}>
                        {availableAttributes.map(attrName => (
                          <div key={attrName} className={selectStyles.attribute}>
                            <span className={selectStyles.attributeName}>{attrName}:</span>
                            <span className={selectStyles.attributeValue}>
                              {getAttributeValue(selectedGroupItem, attrName)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={selectStyles.sectionList}>
              <h3>Доступные предметы ({filteredItems.length})</h3>
              
              {filteredItems.length === 0 ? (
                <p className={selectStyles.noItems}>Нет доступных предметов</p>
              ) : (
                <div className={selectStyles.listContainer}>
                  {filteredItems.map(item => (
                    <div key={item.id} className={selectStyles.listItem}>
                      <div className={selectStyles.itemHeader}>
                        <h4 className={selectStyles.itemName}>{item.name}</h4>
                        <button
                          onClick={() => handleGroupItemSelect(item)}
                          className={buttonStyles.button}
                          disabled={loading}
                        >
                          {selectedGroupItem?.id === item.id ? 'Выбран' : 'Выбрать'}
                        </button>
                      </div>
                      
                      <p className={selectStyles.itemDescription}>{item.description}</p>
                      <p className={styles.itemPrice}>Цена: {item.price}</p>
                      
                      {item.attributes && item.attributes.length > 0 && (
                        <div className={selectStyles.attributes}>
                          <h5>Атрибуты:</h5>
                          <div className={selectStyles.attributesGrid}>
                            {availableAttributes.map(attrName => (
                              <div key={attrName} className={selectStyles.attribute}>
                                <span className={selectStyles.attributeName}>{attrName}:</span>
                                <span className={selectStyles.attributeValue}>
                                  {getAttributeValue(item, attrName)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          {creationMode === 'new' && (
            <>
              <div className={modalStyles.formGroup}>
                <label>Название:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputStyles.input}
                  required
                  disabled={!!editingItem}
                />
              </div>

              <div className={modalStyles.formGroup}>
                <label>Описание:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputStyles.input}
                  rows={3}
                  required
                  disabled={!!editingItem}
                />
              </div>

              <div className={modalStyles.formGroup}>
                <label>Цена за единицу:</label>
                <EvaluatedInput
                  initialValue={price === '' ? '' : price.toString()}
                  onCommit={(value) => setPrice(value.trim() === '' ? 0 : Math.max(0, Number(value.trim())))}
                  className={inputStyles.input}
                  placeholder="Цена за единицу"
                  required
                  disabled={!!editingItem}
                />
              </div>

              <div className={modalStyles.formGroup}>
                <label>Ссылка на изображение (в разработке):</label>
                <input
                  type="text"
                  value={imageLink}
                  onChange={(e) => setImageLink(e.target.value)}
                  className={inputStyles.input}
                  disabled={!!editingItem}
                />
              </div>
            </>
          )}

          <div className={modalStyles.formGroup}>
            <label>Количество:</label>
            <EvaluatedInput
              initialValue={amount === '' ? '' : amount.toString()}
              onCommit={(value) => setAmount(value.trim() === '' ? 1 : Math.max(0, Number(value.trim())))}
              className={inputStyles.input}
              placeholder="Количество"
              required
              disabled={creationMode === 'existing' && !selectedGroupItem && !editingItem}
            />
          </div>

          <div className={modalStyles.buttons}>
            <button type="button" onClick={onClose} className={buttonStyles.button}>
              Отмена
            </button>
            <button 
              type="submit" 
              className={buttonStyles.button} 
              disabled={loading || (creationMode === 'existing' && !selectedGroupItem && !editingItem)}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>

  </ModalPortal>
  );
};

export default CharacterItemModal;