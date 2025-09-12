import React, { useState, useEffect } from 'react';
import { CharacterTemplate, CreateTemplateRequest, UpdateTemplateRequest, TemplateField } from '../../types/characterTemplates';
import buttonStyles from '../../styles/components/Button.module.css';
import inputStyles from '../../styles/components/Input.module.css';
import styles from './CharacterTemplateModal.module.css';

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

  // Функция для генерации ключа на основе названия поля
  const generateFieldKey = (fieldName: string): string => {
    return fieldName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-zа-я0-9_]/g, '');
  };

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name);
      setDescription(editingTemplate.description);
      setFields(editingTemplate.fields);
      
      // Инициализируем ключи полей
      const initialFieldKeys: Record<string, string> = {};
      Object.keys(editingTemplate.fields).forEach(key => {
        initialFieldKeys[key] = key;
      });
      setFieldKeys(initialFieldKeys);
    } else {
      // Сброс формы при создании нового шаблона
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
    const generatedKey = generateFieldKey(fieldName);
    
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
      [fieldKey]: generatedKey,
    }));
  };

  const removeField = (fieldKey: string) => {
    const newFields = { ...fields };
    const newFieldKeys = { ...fieldKeys };
    
    delete newFields[fieldKey];
    delete newFieldKeys[fieldKey];
    
    setFields(newFields);
    setFieldKeys(newFieldKeys);
  };

  const updateField = (fieldKey: string, field: TemplateField) => {
    setFields(prev => ({
      ...prev,
      [fieldKey]: field,
    }));
  };

  const updateFieldKey = (tempKey: string, newKey: string) => {
    setFieldKeys(prev => ({
      ...prev,
      [tempKey]: newKey,
    }));
  };

  const updateFieldName = (tempKey: string, newName: string) => {
    const newFieldKeys = { ...fieldKeys };
    
    // Если ключ еще не задан вручную, генерируем его автоматически
    if (!newFieldKeys[tempKey] || newFieldKeys[tempKey] === generateFieldKey(fields[tempKey].name)) {
      newFieldKeys[tempKey] = generateFieldKey(newName);
    }
    
    setFieldKeys(newFieldKeys);
    
    // Обновляем поле в fields
    updateField(tempKey, {
      ...fields[tempKey],
      name: newName,
    });
  };

  const generateKeyFromName = (tempKey: string) => {
    const fieldName = fields[tempKey]?.name || '';
    const generatedKey = generateFieldKey(fieldName);
    
    setFieldKeys(prev => ({
      ...prev,
      [tempKey]: generatedKey,
    }));
  };

  if (!isOpen) return null;

  return (
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

            {Object.entries(fields).map(([tempKey, field]) => (
              <div key={tempKey} className={styles.field}>
                <div className={styles.formGroup}>
                  <label>Ключ поля:</label>
                  <div className={styles.keyInputGroup}>
                    <input
                      type="text"
                      value={fieldKeys[tempKey] || ''}
                      onChange={(e) => updateFieldKey(tempKey, e.target.value)}
                      className={inputStyles.input}
                      placeholder="Введите ключ поля"
                    />
                    <button 
                      type="button" 
                      onClick={() => generateKeyFromName(tempKey)}
                      className={buttonStyles.button}
                    >
                      Сгенерировать
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Название поля:</label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateFieldName(tempKey, e.target.value)}
                    className={inputStyles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Значение по умолчанию:</label>
                  <input
                    type="number"
                    value={field.value}
                    onChange={(e) => updateField(tempKey, { ...field, value: parseInt(e.target.value) || 0 })}
                    className={inputStyles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Описание поля:</label>
                  <textarea
                    value={field.description}
                    onChange={(e) => updateField(tempKey, { ...field, description: e.target.value })}
                    className={inputStyles.input}
                    rows={2}
                  />
                </div>

                <button 
                  type="button" 
                  onClick={() => removeField(tempKey)}
                  className={buttonStyles.button}
                >
                  Удалить поле
                </button>
              </div>
            ))}
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

export default CharacterTemplateModal;