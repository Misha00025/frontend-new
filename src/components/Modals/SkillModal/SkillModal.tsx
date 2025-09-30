// components/Modals/SkillModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { GroupSkill, CreateGroupSkillRequest, UpdateGroupSkillRequest, SkillAttribute, SkillAttributeDefinition } from '../../../types/groupSkills';
import buttonStyles from '../../../styles/components/Button.module.css';
import inputStyles from '../../../styles/components/Input.module.css';
import styles from './SkillModal.module.css';
import { generateKey } from '../../../utils/generateKey';
import IconButton from '../../Buttons/IconButton';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from '../../../contexts/ThemeContext';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skillData: CreateGroupSkillRequest | UpdateGroupSkillRequest) => Promise<void>;
  editingSkill?: GroupSkill | null;
  availableAttributes: SkillAttributeDefinition[];
  title: string;
}

const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSkill,
  availableAttributes,
  title
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState<SkillAttribute[]>([]);
  const [newAttribute, setNewAttribute] = useState<Partial<SkillAttribute>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingSkill) {
      setName(editingSkill.name);
      setDescription(editingSkill.description);
      setAttributes([...editingSkill.attributes]);
    } else {
      setName('');
      setDescription('');
      setAttributes([]);
    }
    setNewAttribute({});
  }, [editingSkill, isOpen]);

  // Добавляем обработчик горячих клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editorRef.current?.contains(e.target as Node)) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      if (!isCtrl) return;

      // Преобразуем код клавиши в символ независимо от раскладки
      const keyMap: { [key: string]: string } = {
        'KeyB': 'b',
        'KeyI': 'i',
        'KeyK': 'k',
        'KeyL': 'l'
      };

      const key = keyMap[e.code];
      if (key) {
        e.preventDefault();
        
        // Создаем новое событие с английским символом
        const newEvent = new KeyboardEvent('keydown', {
          key: key,
          code: e.code,
          ctrlKey: true,
          metaKey: e.metaKey,
          bubbles: true,
          cancelable: true
        });
        
        e.target?.dispatchEvent(newEvent);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddAttribute = () => {
    if (!newAttribute.key || !newAttribute.value) {
      setError('Ключ и значение обязательны');
      return;
    }

    const attributeDef = availableAttributes.find(attr => attr.key === newAttribute.key);
    
    setAttributes(prev => [...prev, {
      key: newAttribute.key!,
      name: attributeDef?.name || newAttribute.key!,
      description: attributeDef?.description,
      value: newAttribute.value!
    }]);

    setNewAttribute({});
    setError(null);
  };

  const handleCreateNewAttribute = () => {
    if (!newAttribute.name || !newAttribute.value) {
      setError('Ключ, название и значение обязательны для нового атрибута');
      return;
    }

    setAttributes(prev => [...prev, {
      key: generateKey(newAttribute.name!),
      name: newAttribute.name!,
      description: newAttribute.description,
      value: newAttribute.value!
    }]);

    setNewAttribute({});
    setError(null);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const skillData = {
        name,
        description,
        attributes: attributes.map(attr => ({
          key: attr.key,
          name: attr.name,
          value: attr.value
        }))
      };
  
      await onSave(skillData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save skill');
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
            <div ref={editorRef} className={styles.editorContainer} data-color-mode={theme}>
              <MDEditor
                value={description}
                onChange={(value) => setDescription(value || '')}
                preview="edit"
                height={300}
                style={{ width: '100%' }}
                textareaProps={{
                  lang: 'ru',
                  className: styles.markdownTextarea,
                  spellCheck: true
                }}
                previewOptions={{
                  disallowedElements: ['script', 'style']
                }}
              />
            </div>
            <div className={styles.markdownHint}>
              Поддерживает Markdown: **жирный**, *курсив*, `код`, списки и многое другое.
            </div>
          </div>

          <div className={styles.attributesSection}>
            <h3>Атрибуты навыка</h3>
            
            {attributes.map((attr, index) => (
              <div key={index} className={styles.attributeItem}>
                <span className={styles.attributeName}>{attr.name}: {attr.value}</span>
                <IconButton 
                    icon='delete'
                    title='Удалить'
                    onClick={() => handleRemoveAttribute(index)}
                    variant='danger'
                />
              </div>
            ))}

            <div className={styles.addAttribute}>
              <h4>Добавить атрибут</h4>
              
              <select
                value={newAttribute.key || ''}
                onChange={(e) => {
                  const selected = availableAttributes.find(attr => attr.key === e.target.value);
                  setNewAttribute({
                    key: e.target.value,
                    name: selected?.name || '',
                    description: selected?.description
                  });
                }}
                className={inputStyles.input}
              >
                <option value="">Выберите атрибут</option>
                {availableAttributes.map(attr => (
                  <option key={attr.key} value={attr.key}>
                    {attr.name} ({attr.key})
                  </option>
                ))}
              </select>

              {!newAttribute.key && (
                <>
                  <input
                    type="text"
                    value={newAttribute.name || ''}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                    className={inputStyles.input}
                    placeholder="Название нового атрибута"
                  />
                  <input
                    type="text"
                    value={newAttribute.description || ''}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, description: e.target.value }))}
                    className={inputStyles.input}
                    placeholder="Описание"
                  />
                </>
              )}

              <input
                type="text"
                value={newAttribute.value || ''}
                onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                className={inputStyles.input}
                placeholder="Значение"
              />

              <div className={styles.attributeActions}>
                {newAttribute.key ? (
                  <button type="button" onClick={handleAddAttribute} className={buttonStyles.button}>
                    Добавить выбранный атрибут
                  </button>
                ) : (
                  <button type="button" onClick={handleCreateNewAttribute} className={buttonStyles.button}>
                    Создать новый атрибут
                  </button>
                )}
              </div>
            </div>
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

export default SkillModal;