import React, { useState } from 'react';
import { CharacterField } from '../../../../../types/characters';
import { CharacterItem } from '../../../../../types/characterItems';
import { ResourceSettings } from '../../../../../types/resourceSettings';
import buttonStyles from '../../../../../styles/components/Button.module.css';
import modalStyles from '../../../../../styles/modal.module.css';
import styles from './ResourcesSettingsModal.module.css';

interface ResourcesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ResourceSettings) => void;
  fields: [string, CharacterField][];
  items: CharacterItem[];
  initialSettings: ResourceSettings;
}

const ResourcesSettingsModal: React.FC<ResourcesSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  fields,
  items,
  initialSettings,
}) => {
  const [orderedFields, setOrderedFields] = useState<string[]>(() => {
    const fieldKeys = fields.map(([k]) => k);
    const selected = initialSettings.fields.filter(k => fieldKeys.includes(k));
    const unselected = fieldKeys.filter(k => !initialSettings.fields.includes(k));
    return [...selected, ...unselected];
  });

  const [orderedItems, setOrderedItems] = useState<number[]>(() => {
    const itemIds = items.map(i => i.id);
    const selected = initialSettings.items.filter(id => itemIds.includes(id));
    const unselected = itemIds.filter(id => !initialSettings.items.includes(id));
    return [...selected, ...unselected];
  });

  const [selectedFieldsSet, setSelectedFieldsSet] = useState<Set<string>>(new Set(initialSettings.fields));
  const [selectedItemsSet, setSelectedItemsSet] = useState<Set<number>>(new Set(initialSettings.items));

  const [dragFieldIndex, setDragFieldIndex] = useState<number | null>(null);
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const [dragOverFieldIndex, setDragOverFieldIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);

  const handleFieldDragStart = (index: number) => (e: React.DragEvent) => {
    setDragFieldIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleFieldDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFieldIndex(index);
  };

  const handleFieldDragLeave = () => {
    setDragOverFieldIndex(null);
  };

  const handleFieldDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragFieldIndex === null || dragFieldIndex === index) {
      setDragFieldIndex(null);
      setDragOverFieldIndex(null);
      return;
    }
    setOrderedFields(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragFieldIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragFieldIndex(null);
    setDragOverFieldIndex(null);
  };

  const handleItemDragStart = (index: number) => (e: React.DragEvent) => {
    setDragItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleItemDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverItemIndex(index);
  };

  const handleItemDragLeave = () => {
    setDragOverItemIndex(null);
  };

  const handleItemDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragItemIndex === null || dragItemIndex === index) {
      setDragItemIndex(null);
      setDragOverItemIndex(null);
      return;
    }
    setOrderedItems(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragItemIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleSave = () => {
    onSave({
      fields: orderedFields.filter(key => selectedFieldsSet.has(key)),
      items: orderedItems.filter(id => selectedItemsSet.has(id)),
    });
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Настройка ресурсов</h2>

        <div className={modalStyles.formGroup}>
          <h3 className={styles.sectionTitle}>Поля персонажа</h3>
          <div className={styles.checkboxList}>
            {orderedFields.map((fieldKey, index) => {
              const field = fields.find(([k]) => k === fieldKey)?.[1];
              if (!field) return null;
              const isDragging = dragFieldIndex === index;
              const isDragOver = dragOverFieldIndex === index;
              return (
                <div
                  key={fieldKey}
                  className={`${styles.checkboxItem} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''}`}
                  draggable
                  onDragStart={handleFieldDragStart(index)}
                  onDragOver={handleFieldDragOver(index)}
                  onDragLeave={handleFieldDragLeave}
                  onDrop={handleFieldDrop(index)}
                  onDragEnd={() => { setDragFieldIndex(null); setDragOverFieldIndex(null); }}
                >
                  <span className={styles.dragHandle}>⠿</span>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedFieldsSet.has(fieldKey)}
                      onChange={() => {
                        setSelectedFieldsSet(prev => {
                          const next = new Set(prev);
                          if (next.has(fieldKey)) next.delete(fieldKey);
                          else next.add(fieldKey);
                          return next;
                        });
                      }}
                    />
                    {field.name}
                  </label>
                  <div className={styles.moveButtons}>
                    <button
                      className={styles.moveButton}
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderedFields(prev => {
                          const next = [...prev];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          return next;
                        });
                      }}
                      title="Переместить вверх"
                    >
                      ▲
                    </button>
                    <button
                      className={styles.moveButton}
                      disabled={index === orderedFields.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderedFields(prev => {
                          const next = [...prev];
                          [next[index], next[index + 1]] = [next[index + 1], next[index]];
                          return next;
                        });
                      }}
                      title="Переместить вниз"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
            {fields.length === 0 && (
              <p className={styles.empty}>Нет полей</p>
            )}
          </div>
        </div>

        <div className={modalStyles.formGroup}>
          <h3 className={styles.sectionTitle}>Предметы</h3>
          <div className={styles.checkboxList}>
            {orderedItems.map((itemId, index) => {
              const item = items.find(i => i.id === itemId);
              if (!item) return null;
              const isDragging = dragItemIndex === index;
              const isDragOver = dragOverItemIndex === index;
              return (
                <div
                  key={itemId}
                  className={`${styles.checkboxItem} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''}`}
                  draggable
                  onDragStart={handleItemDragStart(index)}
                  onDragOver={handleItemDragOver(index)}
                  onDragLeave={handleItemDragLeave}
                  onDrop={handleItemDrop(index)}
                  onDragEnd={() => { setDragItemIndex(null); setDragOverItemIndex(null); }}
                >
                  <span className={styles.dragHandle}>⠿</span>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedItemsSet.has(itemId)}
                      onChange={() => {
                        setSelectedItemsSet(prev => {
                          const next = new Set(prev);
                          if (next.has(itemId)) next.delete(itemId);
                          else next.add(itemId);
                          return next;
                        });
                      }}
                    />
                    {item.name}
                  </label>
                  <div className={styles.moveButtons}>
                    <button
                      className={styles.moveButton}
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderedItems(prev => {
                          const next = [...prev];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          return next;
                        });
                      }}
                      title="Переместить вверх"
                    >
                      ▲
                    </button>
                    <button
                      className={styles.moveButton}
                      disabled={index === orderedItems.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderedItems(prev => {
                          const next = [...prev];
                          [next[index], next[index + 1]] = [next[index + 1], next[index]];
                          return next;
                        });
                      }}
                      title="Переместить вниз"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <p className={styles.empty}>Нет предметов</p>
            )}
          </div>
        </div>

        <div className={modalStyles.buttons}>
          <button className={buttonStyles.button} onClick={handleSave}>
            Сохранить
          </button>
          <button className={buttonStyles.button} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesSettingsModal;
