import React, { useState, useEffect } from 'react';
import { CharacterField } from '../../../types/characters';
import { TemplateCategory } from '../../../types/characterTemplates';
import buttonStyles from '../../../styles/components/Button.module.css';
import inputStyles from '../../../styles/components/Input.module.css';
import styles from './CharacterFieldModal.module.css';

const generateFieldKey = (fieldName: string): string => {
  return fieldName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-zа-я0-9_]/g, '');
};

interface CharacterFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: CharacterField, fieldKey: string) => void;
  field: CharacterField | null;
  fieldKey: string;
  title: string;
  isKeyEditable?: boolean;
  categories?: TemplateCategory[]; // Добавляем опциональный пропс для категорий
}

const CharacterFieldModal: React.FC<CharacterFieldModalProps> = ({
  isOpen,
  onClose,
  onSave,
  field,
  fieldKey,
  title,
  isKeyEditable = true,
  categories = [] // Значение по умолчанию - пустой массив
}) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState<number | ''>('');
  const [maxValue, setMaxValue] = useState<number | '' | null>(null);
  const [description, setDescription] = useState('');
  const [key, setKey] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Заполняем форму данными при открытии
  useEffect(() => {
    if (field) {
      setName(field.name);
      setValue(field.value);
      setMaxValue(field.maxValue ? field.maxValue : null)
      setDescription(field.description || '');
      setKey(fieldKey);
      setCategory(field.category || '');
    } else {
      // Сброс формы при создании нового поля
      const newName = 'Новое поле'
      setName(newName);
      setValue(0);
      setDescription('');
      setKey(generateFieldKey(newName));
      setCategory('');
    }
  }, [field, fieldKey, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Название поля обязательно');
      return;
    }

    if (!key.trim() && isKeyEditable) {
      setError('Ключ поля обязателен');
      return;
    }

    const fieldData: CharacterField = {
      name,
      value: value === ''? 0 : value,
      description,
    };
    if (maxValue !== null){
      fieldData.maxValue = maxValue === ''? 0 : maxValue;
    }
    if (category) {
      fieldData.category = category;
    }

    onSave(fieldData, key);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{title}</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {isKeyEditable && (
            <div className={styles.formGroup}>
              <label>Ключ поля:</label>
              <input
                type="text"
                value={key}
                onChange={(e) => {setKey(e.target.value)}}
                className={inputStyles.input}
                required
                disabled={true}
              />
              <small className={styles.helpText}>
                Ключ используется в системе (только латинские буквы, цифры и _)
              </small>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Название поля:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {setName(e.target.value); if (isKeyEditable) setKey(generateFieldKey(e.target.value))}}
              className={inputStyles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Значение:</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value === ''? '' : Number(e.target.value))}
              onBlur={(e) => setValue(e.target.value === ''? 0 : Number(e.target.value))}
              className={inputStyles.input}
              required
            />
          </div>

          {maxValue !== null && (
            <div className={styles.formGroup}>
              <label>Максимальное значение:</label>
              <input
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value === ''? '' : Number(e.target.value))}
                onBlur={(e) => setMaxValue(e.target.value === ''? 0 : Number(e.target.value))}
                className={inputStyles.input}
                required
              />
            </div>
          )}
          <div className={styles.formGroup}>
            <label>Описание поля:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputStyles.input}
              rows={3}
            />
          </div>

          {/* Поле выбора категории, только если есть категории */}
          {categories.length > 0 && (
            <div className={styles.formGroup}>
              <label>Категория:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputStyles.input}
              >
                <option value="">Без категории</option>
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.buttons}>
            <button type="button" onClick={onClose} className={buttonStyles.button}>
              Отмена
            </button>
            <button type="submit" className={buttonStyles.button}>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterFieldModal;