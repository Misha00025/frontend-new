import React, { useState, useEffect } from 'react';
import buttonStyles from '../../../../../styles/components/Button.module.css';
import inputStyles from '../../../../../styles/components/Input.module.css';
import styles from './CharacterTemplateModal.module.css';
import { TemplateCategory } from '../../../../../types/groupSchemas';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: TemplateCategory) => void;
  category?: TemplateCategory | null;
  title: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  title
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName('');
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      fields: category?.fields || []
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{title}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Название категории:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyles.input}
              required
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

export default CategoryModal;