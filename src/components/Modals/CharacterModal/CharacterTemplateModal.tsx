import React, { useState, useEffect } from 'react';
import { CharacterTemplate, CreateTemplateRequest, UpdateTemplateRequest, TemplateField } from '../../../types/characterTemplates';
import TemplateFieldModal from '../CharacterFieldModal/TemplateFieldModal';
import buttonStyles from '../../../styles/components/Button.module.css';
import inputStyles from '../../../styles/components/Input.module.css';
import styles from './CharacterTemplateModal.module.css';
import IconButton from '../../Buttons/IconButton';

interface CharacterTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: CreateTemplateRequest | UpdateTemplateRequest) => Promise<void>;
  editingTemplate?: CharacterTemplate | null;
  title: string;
}

const CharacterTemplateModal: React.FC<CharacterTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTemplate,
  title
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<Record<string, TemplateField>>({});
  const [fieldKeys, setFieldKeys] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<{ key: string; field: TemplateField } | null>(null);

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name);
      setDescription(editingTemplate.description);
      setFields(editingTemplate.fields);
      
      const initialFieldKeys: Record<string, string> = {};
      Object.keys(editingTemplate.fields).forEach(key => {
        initialFieldKeys[key] = key;
      });
      setFieldKeys(initialFieldKeys);
    } else {
      setName('');
      setDescription('');
      setFields({});
      setFieldKeys({});
    }
  }, [editingTemplate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Преобразуем поля с использованием правильных ключей
      const fieldsWithCorrectKeys: Record<string, TemplateField> = {};
      
      Object.entries(fields).forEach(([tempKey, field]) => {
        const finalKey = fieldKeys[tempKey] || tempKey;
        fieldsWithCorrectKeys[finalKey] = field;
      });

      const templateData = {
        name,
        description,
        fields: fieldsWithCorrectKeys,
      };

      await onSave(templateData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    const fieldKey = `field_${Date.now()}`;
    const fieldName = `Новое поле ${Object.keys(fields).length + 1}`;
    
    setFields(prev => ({
      ...prev,
      [fieldKey]: {
        name: fieldName,
        value: 0,
        description: '',
      },
    }));
    
    setFieldKeys(prev => ({
      ...prev,
      [fieldKey]: fieldKey,
    }));

    // Открываем модальное окно для редактирования нового поля
    setEditingField({ key: fieldKey, field: { name: fieldName, value: 0, description: '' } });
    setIsFieldModalOpen(true);
  };

  const removeField = (fieldKey: string) => {
    const newFields = { ...fields };
    const newFieldKeys = { ...fieldKeys };
    
    delete newFields[fieldKey];
    delete newFieldKeys[fieldKey];
    
    setFields(newFields);
    setFieldKeys(newFieldKeys);
  };

  const editField = (fieldKey: string) => {
    setEditingField({ key: fieldKey, field: fields[fieldKey] });
    setIsFieldModalOpen(true);
  };

  const handleSaveField = (field: TemplateField, fieldKey: string) => {
    setFields(prev => ({
      ...prev,
      [editingField!.key]: field,
    }));

    if (fieldKey !== editingField!.key) {
      const newFieldKeys = { ...fieldKeys };
      newFieldKeys[fieldKey] = fieldKey;
      
      if (fieldKey !== editingField!.key) {
        delete newFieldKeys[editingField!.key];
        
        const newFields = { ...fields };
        newFields[fieldKey] = field;
        delete newFields[editingField!.key];
        setFields(newFields);
      }
      
      setFieldKeys(newFieldKeys);
    }
  };

  const handleCloseFieldModal = () => {
    setIsFieldModalOpen(false);
    setEditingField(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <h2>{title}</h2>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Название шаблона:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputStyles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Описание шаблона:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputStyles.input}
                rows={3}
                required
              />
            </div>

            <div className={styles.fieldsSection}>
              <h3>Поля шаблона:</h3>
              <button type="button" onClick={addField} className={buttonStyles.button}>
                Добавить поле
              </button>

              {Object.entries(fields).map(([key, field]) => (
                <div key={key} className={styles.fieldCard}>
                  <div className={styles.fieldHeader}>
                    <h4>{field.name}</h4>
                    <span className={styles.fieldKey}>({fieldKeys[key]})</span>
                  </div>
                  <p className={styles.fieldDescription}>{field.description}</p>
                  <p className={styles.fieldValue}>Значение по умолчанию: {field.value}</p>
                  
                  <div className={styles.fieldActions}>
                    <IconButton 
                      icon="edit" 
                      onClick={()=> editField(key)}
                      title="Редактировать"
                      size="small"
                      variant="primary"
                    />
                    <IconButton 
                      icon="delete" 
                      onClick={()=> removeField(key)}
                      title="Удалить"
                      size="small"
                      variant="primary"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.buttons}>
              <button type="button" onClick={onClose} className={buttonStyles.button}>
                Отмена
              </button>
              <button type="submit" className={buttonStyles.button} disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить шаблон'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <TemplateFieldModal 
        isOpen={isFieldModalOpen}
        onClose={handleCloseFieldModal}
        onSave={handleSaveField}
        field={editingField?.field || null}
        fieldKey={editingField?.key || ''}
        title={editingField ? 'Редактирование поля' : 'Создание поля'}
      />
    </>
  );
};

export default CharacterTemplateModal;