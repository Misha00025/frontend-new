// components/Modals/SkillAttributesModal.tsx
import React, { useState, useEffect } from 'react';
import { SkillAttributeDefinition } from '../../../types/groupSkills';
import buttonStyles from '../../../styles/components/Button.module.css';
import inputStyles from '../../../styles/components/Input.module.css';
import styles from './SkillAttributesModal.module.css';
import IconButton from '../../Buttons/IconButton';
import List from '../../List/List';

interface SkillAttributesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attributes: SkillAttributeDefinition[]) => Promise<void>;
  attributes: SkillAttributeDefinition[];
  title: string;
}

const SkillAttributesModal: React.FC<SkillAttributesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  attributes,
  title
}) => {
  const [localAttributes, setLocalAttributes] = useState<SkillAttributeDefinition[]>([]);
  const [newAttribute, setNewAttribute] = useState<Partial<SkillAttributeDefinition>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalAttributes([...attributes]);
    }
  }, [attributes, isOpen]);

  const handleAddAttribute = () => {
    if (!newAttribute.key || !newAttribute.name) {
      setError('Ключ и название обязательны');
      return;
    }

    if (localAttributes.find(attr => attr.key === newAttribute.key)) {
      setError('Атрибут с таким ключом уже существует');
      return;
    }

    setLocalAttributes(prev => [...prev, {
      key: newAttribute.key!,
      name: newAttribute.name!,
      description: newAttribute.description || '',
      isFiltered: newAttribute.isFiltered || false,
      knownValues: []
    }]);

    setNewAttribute({});
    setError(null);
  };

  const handleRemoveAttribute = (index: number) => {
    setLocalAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateAttribute = (index: number, field: keyof SkillAttributeDefinition, value: any) => {
    setLocalAttributes(prev => prev.map((attr, i) => 
      i === index ? { ...attr, [field]: value } : attr
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(localAttributes);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save attributes');
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
        
        <div className={styles.attributesList}>
          <h3>Существующие атрибуты</h3>
          {localAttributes.map((attr, index) => (
            <List layout='horizontal' gap='small'>
              <input
                type="text"
                value={attr.key}
                onChange={(e) => handleUpdateAttribute(index, 'key', e.target.value)}
                className={inputStyles.input}
                placeholder="Ключ"
              />
              <input
                type="text"
                value={attr.name}
                onChange={(e) => handleUpdateAttribute(index, 'name', e.target.value)}
                className={inputStyles.input}
                placeholder="Название"
              />
              <input
                type="text"
                value={attr.description || ''}
                onChange={(e) => handleUpdateAttribute(index, 'description', e.target.value)}
                className={inputStyles.input}
                placeholder="Описание"
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={attr.isFiltered}
                  onChange={(e) => handleUpdateAttribute(index, 'isFiltered', e.target.checked)}
                />
                Фильтруемый
              </label>
              <IconButton
                icon='delete'
                title='удалить'
                onClick={() => handleRemoveAttribute(index)}
                variant='danger'
              />
            </List>
          ))}
        </div>

        <div className={styles.addAttribute}>
          <h3>Добавить атрибут</h3>
          <div className={styles.newAttributeForm}>
            <input
              type="text"
              value={newAttribute.key || ''}
              onChange={(e) => setNewAttribute(prev => ({ ...prev, key: e.target.value }))}
              className={inputStyles.input}
              placeholder="Ключ"
            />
            <input
              type="text"
              value={newAttribute.name || ''}
              onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
              className={inputStyles.input}
              placeholder="Название"
            />
            <button
              type="button"
              onClick={handleAddAttribute}
              className={buttonStyles.button}
            >
              Добавить
            </button>
          </div>
        </div>

        <div className={styles.buttons}>
          <button type="button" onClick={onClose} className={buttonStyles.button}>
            Отмена
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            className={buttonStyles.button}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillAttributesModal;