import React, { useState, useEffect } from 'react';
import { CharacterTemplate, CreateTemplateRequest, UpdateTemplateRequest, TemplateField, TemplateCategory, TemplateSchema } from '../../../types/characterTemplates';
import TemplateFieldModal from '../CharacterFieldModal/TemplateFieldModal';
import CategoryModal from './CategoryModal';
import buttonStyles from '../../../styles/components/Button.module.css';
import inputStyles from '../../../styles/components/Input.module.css';
import styles from './CharacterTemplateModal.module.css';
import IconButton from '../../Buttons/IconButton';
import EditedTemplateFieldCard from '../../Cards/FieldCard/EditedTemplateFieldCard';
import TemplateCategoryCard from '../../Cards/CategoryCard/TemplateCategoryCard';

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
  const [schema, setSchema] = useState<TemplateSchema>({ categories: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<{ key: string; field: TemplateField } | null>(null);
  const [editingCategory, setEditingCategory] = useState<TemplateCategory | null>(null);
  const [selectedCategoryForField, setSelectedCategoryForField] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name);
      setDescription(editingTemplate.description);
      setFields(editingTemplate.fields);
      setSchema(editingTemplate.schema || { categories: [] });
    } else {
      setName('');
      setDescription('');
      setFields({});
      setSchema({ categories: [] });
    }
  }, [editingTemplate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const templateData = {
        name,
        description,
        fields,
        schema
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
    
    const newField = {
      name: fieldName,
      value: 0,
      description: '',
    };

    setFields(prev => ({ ...prev, [fieldKey]: newField }));
    setEditingField({ key: fieldKey, field: newField });
    setIsFieldModalOpen(true);
  };

  const addFieldToTemplate = (field: TemplateField): string => {
    const fieldKey = `field_${Date.now()}`;
    setFields(prev => ({ ...prev, [fieldKey]: field }));
    setEditingField({ key: fieldKey, field: field });
    setIsFieldModalOpen(true);
    return fieldKey;
  };
  
  const updateCategory = (updatedCategory: TemplateCategory) => {
    setSchema(prev => ({
      categories: prev.categories.map(c => 
        c.key === updatedCategory.key ? updatedCategory : c
      )
    }));
  };

  const removeField = (fieldKey: string) => {
    const newFields = { ...fields };
    delete newFields[fieldKey];
    setFields(newFields);

    setSchema(prev => ({
      categories: prev.categories.map(category => ({
        ...category,
        fields: category.fields.filter(f => f !== fieldKey)
      }))
    }));
  };

  const editField = (fieldKey: string) => {
    setEditingField({ key: fieldKey, field: fields[fieldKey] });
    setIsFieldModalOpen(true);
  };

  const handleSaveField = (field: TemplateField, fieldKey: string) => {
    const newFields = { ...fields };
    
    if (fieldKey !== editingField!.key) {
      delete newFields[editingField!.key];
      newFields[fieldKey] = field;

      setSchema(prev => ({
        categories: prev.categories.map(category => ({
          ...category,
          fields: category.fields.map(f => f === editingField!.key ? fieldKey : f)
        }))
      }));
    } else {
      newFields[fieldKey] = field;
    }

    setFields(newFields);
  };

  const addCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const editCategory = (category: TemplateCategory) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const removeCategory = (categoryKey: string) => {
    setSchema(prev => ({
      categories: prev.categories.filter(category => category.key !== categoryKey)
    }));
  };

  const moveCategoryUp = (index: number) => {
    if (index <= 0) return;
    const newCategories = [...schema.categories];
    [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
    setSchema({ ...schema, categories: newCategories });
  };

  const moveCategoryDown = (index: number) => {
    if (index >= schema.categories.length - 1) return;
    const newCategories = [...schema.categories];
    [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    setSchema({ ...schema, categories: newCategories });
  };

  const handleSaveCategory = (category: TemplateCategory) => {
    if (editingCategory) {
      setSchema(prev => ({
        categories: prev.categories.map(c => 
          c.key === editingCategory.key ? category : c
        )
      }));
    } else {
      setSchema(prev => ({
        categories: [...prev.categories, category]
      }));
    }
    setIsCategoryModalOpen(false);
  };

  const moveFieldToCategory = (fieldKey: string, categoryKey: string) => {
    if (categoryKey === 'other') {
      setSchema(prev => ({
        categories: prev.categories.map(category => ({
          ...category,
          fields: category.fields.filter(f => f !== fieldKey)
        }))
      }));
    } else {
      setSchema(prev => ({
        categories: prev.categories.map(category => 
          category.key === categoryKey
            ? { ...category, fields: [...category.fields, fieldKey] }
            : { ...category, fields: category.fields.filter(f => f !== fieldKey) }
        )
      }));
    }
  };  

  const getUncategorizedFields = () => {
    const allFieldKeys = new Set(Object.keys(fields));
    const categorizedFields = new Set(schema.categories.flatMap(c => c.fields));
    return Array.from(allFieldKeys).filter(key => !categorizedFields.has(key));
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
              <h3>Категории полей:</h3>
              <button type="button" onClick={addCategory} className={buttonStyles.button}>
                Добавить категорию
              </button>

              {schema.categories.map((category, index) => (
                <TemplateCategoryCard
                  key={category.key}
                  category={category}
                  index={index}
                  totalCategories={schema.categories.length}
                  fields={fields}
                  selectedCategoryForField={selectedCategoryForField}
                  onAddFieldToTemplate={addFieldToTemplate}
                  onEditCategory={editCategory}
                  onRemoveCategory={removeCategory}
                  onMoveCategoryUp={moveCategoryUp}
                  onMoveCategoryDown={moveCategoryDown}
                  onEditField={editField}
                  onRemoveField={removeField}
                  onMoveFieldToCategory={moveFieldToCategory}
                  onCategoryChange={(fieldKey, categoryKey) => 
                    setSelectedCategoryForField(prev => ({ ...prev, [fieldKey]: categoryKey }))
                  }
                  onUpdateCategory={updateCategory}
                />
              ))}

              <div className={styles.categoryCard}>
                <h4>Другое</h4>
                <button 
                  type="button" 
                  onClick={() => addField()}
                  className={buttonStyles.button}
                >
                  Добавить поле
                </button>

                {getUncategorizedFields().map(fieldKey => (
                  <EditedTemplateFieldCard
                    key={fieldKey}
                    fieldKey={fieldKey}
                    field={fields[fieldKey]}
                    onEdit={editField}
                    onRemove={removeField}
                    onMoveToCategory={moveFieldToCategory}
                    categories={schema.categories}
                    selectedCategoryForField={selectedCategoryForField[fieldKey] || ''}
                    onCategoryChange={(fieldKey, categoryKey) => 
                      setSelectedCategoryForField(prev => ({ ...prev, [fieldKey]: categoryKey }))
                    }
                  />
                ))}
              </div>
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
        onClose={() => setIsFieldModalOpen(false)}
        onSave={handleSaveField}
        field={editingField?.field || null}
        fieldKey={editingField?.key || ''}
        title={editingField ? 'Редактирование поля' : 'Создание поля'}
      />

      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
        title={editingCategory ? 'Редактирование категории' : 'Создание категории'}
      />
    </>
  );
};

export default CharacterTemplateModal;