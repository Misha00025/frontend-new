import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterTemplate, CreateTemplateRequest, TemplateField } from '../../types/characterTemplates';
import { characterTemplatesAPI } from '../../services/api';
import buttonStyles from '../../styles/components/Button.module.css';
import inputStyles from '../../styles/components/Input.module.css';
import styles from './CharacterTemplates.module.css';

// Функция для генерации ключа на основе названия поля
const generateFieldKey = (fieldName: string): string => {
  return fieldName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-zа-я0-9_]/g, '');
};

const CharacterTemplates: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [templates, setTemplates] = useState<CharacterTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CharacterTemplate | null>(null);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    name: '',
    description: '',
    fields: {},
  });

  // Состояние для ключей полей (отдельно от значений полей)
  const [fieldKeys, setFieldKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    if (groupId) {
      loadTemplates();
    }
  }, [groupId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await characterTemplatesAPI.getTemplates(parseInt(groupId!));
      setTemplates(templatesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Функция для обновления ключа поля при изменении названия
  const updateFieldName = (fieldKey: string, newName: string) => {
    const newFieldKeys = { ...fieldKeys };
    
    // Если ключ еще не задан вручную, генерируем его автоматически
    if (!newFieldKeys[fieldKey] || newFieldKeys[fieldKey] === generateFieldKey(formData.fields[fieldKey].name)) {
      newFieldKeys[fieldKey] = generateFieldKey(newName);
    }
    
    setFieldKeys(newFieldKeys);
    
    // Обновляем поле в formData
    updateField(fieldKey, {
      ...formData.fields[fieldKey],
      name: newName,
    });
  };

  const handleCreateTemplate = async () => {
    try {
      // Преобразуем поля с использованием правильных ключей
      const fieldsWithCorrectKeys: Record<string, TemplateField> = {};
      
      Object.entries(formData.fields).forEach(([tempKey, field]) => {
        const finalKey = fieldKeys[tempKey] || tempKey;
        fieldsWithCorrectKeys[finalKey] = field;
      });
      
      const requestData = {
        ...formData,
        fields: fieldsWithCorrectKeys,
      };
      
      await characterTemplatesAPI.createTemplate(parseInt(groupId!), requestData);
      setShowCreateForm(false);
      setFormData({ name: '', description: '', fields: {} });
      setFieldKeys({});
      loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      // Преобразуем поля с использованием правильных ключей
      const fieldsWithCorrectKeys: Record<string, TemplateField> = {};
      
      Object.entries(formData.fields).forEach(([tempKey, field]) => {
        const finalKey = fieldKeys[tempKey] || tempKey;
        fieldsWithCorrectKeys[finalKey] = field;
      });
      
      const requestData = {
        ...formData,
        fields: fieldsWithCorrectKeys,
      };
      
      await characterTemplatesAPI.updateTemplate(parseInt(groupId!), editingTemplate.id, requestData);
      setEditingTemplate(null);
      setFormData({ name: '', description: '', fields: {} });
      setFieldKeys({});
      loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот шаблон?')) return;

    try {
      await characterTemplatesAPI.deleteTemplate(parseInt(groupId!), templateId);
      loadTemplates(); // Перезагружаем список шаблонов
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  const handleEditTemplate = (template: CharacterTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      fields: template.fields,
    });
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setShowCreateForm(false);
    setFormData({ name: '', description: '', fields: {} });
  };

  const addField = () => {
    const fieldKey = `field_${Date.now()}`;
    const fieldName = `Новое поле ${Object.keys(formData.fields).length + 1}`;
    const generatedKey = generateFieldKey(fieldName);
    
    setFormData({
      ...formData,
      fields: {
        ...formData.fields,
        [fieldKey]: {
          name: fieldName,
          value: 0,
          description: '',
        },
      },
    });
    
    setFieldKeys({
      ...fieldKeys,
      [fieldKey]: generatedKey,
    });
  };

  const removeField = (fieldKey: string) => {
    const newFields = { ...formData.fields };
    const newFieldKeys = { ...fieldKeys };
    
    delete newFields[fieldKey];
    delete newFieldKeys[fieldKey];
    
    setFormData({
      ...formData,
      fields: newFields,
    });
    
    setFieldKeys(newFieldKeys);
  };

  const updateField = (fieldKey: string, field: TemplateField) => {
    setFormData({
      ...formData,
      fields: {
        ...formData.fields,
        [fieldKey]: field,
      },
    });
  };

  const updateFieldKey = (tempKey: string, newKey: string) => {
    setFieldKeys({
      ...fieldKeys,
      [tempKey]: newKey,
    });
  };

  const generateKeyFromName = (tempKey: string) => {
    const fieldName = formData.fields[tempKey].name;
    const generatedKey = generateFieldKey(fieldName);
    
    setFieldKeys({
      ...fieldKeys,
      [tempKey]: generatedKey,
    });
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1>Шаблоны персонажей</h1>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button 
          className={buttonStyles.button}
          onClick={() => setShowCreateForm(true)}
        >
          Создать шаблон
        </button>
      </div>

      {(showCreateForm || editingTemplate) && (
        <div className={styles.form}>
          <h2>{editingTemplate ? 'Редактирование шаблона' : 'Создание шаблона'}</h2>
          
          <div className={styles.formGroup}>
            <label>Название:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputStyles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Описание:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputStyles.input}
              rows={3}
            />
          </div>

          <div className={styles.fieldsSection}>
            <h3>Поля шаблона:</h3>
            <button type="button" onClick={addField} className={buttonStyles.button}>
              Добавить поле
            </button>

            {Object.entries(formData.fields).map(([tempKey, field]) => (
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
                  <small>Ключ будет использоваться в системе (только латинские буквы, цифры и _)</small>
                </div>

                <div className={styles.formGroup}>
                  <label>Название поля:</label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateFieldName(tempKey, e.target.value)}
                    className={inputStyles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Значение по умолчанию:</label>
                  <input
                    type="number"
                    value={field.value}
                    onChange={(e) => updateField(tempKey, { ...field, value: parseInt(e.target.value) || 0 })}
                    className={inputStyles.input}
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

          <div className={styles.formActions}>
            <button 
              type="button"
              onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
              className={buttonStyles.button}
            >
              {editingTemplate ? 'Сохранить' : 'Создать'}
            </button>
            <button 
              type="button"
              onClick={handleCancelEdit}
              className={buttonStyles.button}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className={styles.templatesList}>
        <h2>Список шаблонов</h2>
        {templates.length === 0 ? (
          <p>Шаблонов пока нет</p>
        ) : (
          templates.map(template => (
            <div key={template.id} className={styles.templateCard}>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              
              <div className={styles.templateFields}>
                <h4>Поля:</h4>
                {Object.entries(template.fields).map(([key, field]) => (
                  <div key={key} className={styles.fieldInfo}>
                    <strong>{field.name}</strong>: {field.value} - {field.description}
                  </div>
                ))}
              </div>

              <div className={styles.templateActions}>
                <button 
                  onClick={() => handleEditTemplate(template)}
                  className={buttonStyles.button}
                >
                  Редактировать
                </button>
                <button 
                  onClick={() => handleDeleteTemplate(template.id)}
                  className={buttonStyles.button}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CharacterTemplates;