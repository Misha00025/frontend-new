import React, { useState, useEffect } from 'react';
import buttonStyles from '../../../../../styles/components/Button.module.css';
import inputStyles from '../../../../../styles/components/Input.module.css';
import modalStyles from '../../../../../styles/modal.module.css';
import { TemplateCategory } from '../../../../../types/groupSchemas';
import ModalPortal from '../../../../../components/commons/ModalPortal/ModalPortal';

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

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <h2>{title}</h2>
      <div className={modalStyles.modalBody}>
      
      <form onSubmit={handleSubmit}>
        <div className={modalStyles.formGroup}>
          <label>Название категории:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputStyles.input}
            required
          />
        </div>

        </form>
        </div>
        <div className={modalStyles.buttons}>
          <button type="button" onClick={onClose} className={buttonStyles.button}>
            Отмена
          </button>
          <button type="submit" className={buttonStyles.button}>
            Сохранить
          </button>
        </div>
    </ModalPortal>
  );
};

export default CategoryModal;