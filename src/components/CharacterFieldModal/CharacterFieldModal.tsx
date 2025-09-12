import React, { useState, useEffect } from 'react';
import { CharacterField } from '../../types/characters';
import buttonStyles from '../../styles/components/Button.module.css';
import inputStyles from '../../styles/components/Input.module.css';
import styles from './CharacterFieldModal.module.css';

interface CharacterFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: CharacterField, fieldKey: string) => void;
  field: CharacterField | null;
  fieldKey: string;
  title: string;
  isKeyEditable?: boolean;
}

const CharacterFieldModal: React.FC<CharacterFieldModalProps> = ({
  isOpen,
  onClose,
  onSave,
  field,
  fieldKey,
  title,
  isKeyEditable = true
}) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState(0);
  const [description, setDescription] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Заполняем форму данными при открытии
  useEffect(() => {
    if (field) {
      setName(field.name);
      setValue(field.value);
      setDescription(field.description || '');
      setKey(fieldKey);
    } else {
      // Сброс формы при создании нового поля
      setName('');
      setValue(0);
      setDescription('');
      setKey('');
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
      value,
      description,
    };

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
                onChange={(e) => setKey(e.target.value)}
                className={inputStyles.input}
                required
                disabled={!isKeyEditable}
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
              onChange={(e) => setName(e.target.value)}
              className={inputStyles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Значение:</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className={inputStyles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Описание поля:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputStyles.input}
              rows={3}
            />
          </div>

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