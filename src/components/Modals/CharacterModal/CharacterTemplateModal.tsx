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
  const [editingCategoryParent, setEditingCategoryParent] = useState<TemplateCategory | null>(null);
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

  const getAllCategories = (categories: TemplateCategory[]): TemplateCategory[] => {
    let allCategories: TemplateCategory[] = [];
    
    categories.forEach(category => {
      allCategories.push(category);
      if (category.categories && category.categories.length > 0) {
        allCategories = allCategories.concat(getAllCategories(category.categories));
      }
    });
    
    return allCategories;
  };

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
  
  const updateCategory = (updatedCategory: TemplateCategory, parentCategory?: TemplateCategory) => {
    if (parentCategory) {
      // Обновляем вложенную категорию
      setSchema(prev => ({
        categories: prev.categories.map(c => 
          c.key === parentCategory.key
            ? { ...c, categories: c.categories?.map(sc => sc.key === updatedCategory.key ? updatedCategory : sc) }
            : c
        )
      }));
    } else {
      // Обновляем категорию верхнего уровня
      setSchema(prev => ({
        categories: prev.categories.map(c => 
          c.key === updatedCategory.key ? updatedCategory : c
        )
      }));
    }
  };

  const removeField = (fieldKey: string) => {
    const newFields = { ...fields };
    delete newFields[fieldKey];
    setFields(newFields);

    // Рекурсивно удаляем поле из всех категорий
    const removeFieldFromCategories = (categories: TemplateCategory[]): TemplateCategory[] => {
      return categories.map(category => ({
        ...category,
        fields: category.fields.filter(f => f !== fieldKey),
        categories: category.categories ? removeFieldFromCategories(category.categories) : undefined
      }));
    };

    setSchema(prev => ({
      categories: removeFieldFromCategories(prev.categories)
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

      // Рекурсивно обновляем ключи полей во всех категориях
      const updateFieldKeyInCategories = (categories: TemplateCategory[]): TemplateCategory[] => {
        return categories.map(category => ({
          ...category,
          fields: category.fields.map(f => f === editingField!.key ? fieldKey : f),
          categories: category.categories ? updateFieldKeyInCategories(category.categories) : undefined
        }));
      };

      setSchema(prev => ({
        categories: updateFieldKeyInCategories(prev.categories)
      }));
    } else {
      newFields[fieldKey] = field;
    }

    setFields(newFields);
  };

  const addCategory = (parentCategory?: TemplateCategory) => {
    setEditingCategory(null);
    setEditingCategoryParent(parentCategory || null);
    setIsCategoryModalOpen(true);
  };

  const editCategory = (category: TemplateCategory, parentCategory?: TemplateCategory) => {
    setEditingCategory(category);
    setEditingCategoryParent(parentCategory || null);
    setIsCategoryModalOpen(true);
  };

  const removeCategory = (categoryKey: string, parentCategory?: TemplateCategory) => {
    if (parentCategory) {
      // Удаляем вложенную категорию
      setSchema(prev => ({
        categories: prev.categories.map(c => 
          c.key === parentCategory.key
            ? { ...c, categories: c.categories?.filter(sc => sc.key !== categoryKey) }
            : c
        )
      }));
    } else {
      // Удаляем категорию верхнего уровня
      setSchema(prev => ({
        categories: prev.categories.filter(category => category.key !== categoryKey)
      }));
    }
  };

  const moveCategoryUp = (index: number, parentCategory?: TemplateCategory) => {
    if (index <= 0) return;
    
    if (parentCategory) {
      // Перемещаем вложенную категорию
      setSchema(prev => ({
        categories: prev.categories.map(c => 
          c.key === parentCategory.key && c.categories
            ? { ...c, categories: moveItemInArray(c.categories, index, index - 1) }
            : c
        )
      }));
    } else {
      // Перемещаем категорию верхнего уровня
      setSchema(prev => ({
        categories: moveItemInArray(prev.categories, index, index - 1)
      }));
    }
  };

  const moveCategoryDown = (index: number, parentCategory?: TemplateCategory) => {
    if (parentCategory) {
      // Перемещаем вложенную категорию
      const categories = parentCategory.categories || [];
      if (index >= categories.length - 1) return;
      
      setSchema(prev => ({
        categories: prev.categories.map(c => 
          c.key === parentCategory.key && c.categories
            ? { ...c, categories: moveItemInArray(c.categories, index, index + 1) }
            : c
        )
      }));
    } else {
      // Перемещаем категорию верхнего уровня
      if (index >= schema.categories.length - 1) return;
      setSchema(prev => ({
        categories: moveItemInArray(prev.categories, index, index + 1)
      }));
    }
  };

  // Вспомогательная функция для перемещения элемента в массиве
  const moveItemInArray = <T,>(array: T[], from: number, to: number): T[] => {
    const newArray = [...array];
    [newArray[from], newArray[to]] = [newArray[to], newArray[from]];
    return newArray;
  };

  const handleSaveCategory = (category: TemplateCategory) => {
    if (editingCategory) {
      // Редактирование существующей категории
      if (editingCategoryParent) {
        // Редактируем вложенную категорию
        setSchema(prev => ({
          categories: prev.categories.map(c => 
            c.key === editingCategoryParent.key
              ? { ...c, categories: c.categories?.map(sc => sc.key === editingCategory.key ? category : sc) }
              : c
          )
        }));
      } else {
        // Редактируем категорию верхнего уровня
        setSchema(prev => ({
          categories: prev.categories.map(c => 
            c.key === editingCategory.key ? category : c
          )
        }));
      }
    } else {
      // Создание новой категории
      if (editingCategoryParent) {
        // Добавляем вложенную категорию
        setSchema(prev => ({
          categories: prev.categories.map(c => 
            c.key === editingCategoryParent.key
              ? { ...c, categories: [...(c.categories || []), category] }
              : c
          )
        }));
      } else {
        // Добавляем категорию верхнего уровня
        setSchema(prev => ({
          categories: [...prev.categories, category]
        }));
      }
    }
    setIsCategoryModalOpen(false);
  };

  const moveFieldToCategory = (fieldKey: string, categoryKey: string | null) => {
    const removeFieldFromAllCategories = (categories: TemplateCategory[]): TemplateCategory[] => {
      return categories.map(category => ({
        ...category,
        fields: category.fields.filter(f => f !== fieldKey),
        categories: category.categories ? removeFieldFromAllCategories(category.categories) : undefined
      }));
    };
    let updatedCategories = removeFieldFromAllCategories(schema.categories);
    if (categoryKey) {
      const addFieldToCategory = (categories: TemplateCategory[]): TemplateCategory[] => {
        return categories.map(category => {
          if (category.key === categoryKey) {
            return {
              ...category,
              fields: [...category.fields, fieldKey]
            };
          } else if (category.categories) {
            return {
              ...category,
              categories: addFieldToCategory(category.categories)
            };
          }
          return category;
        });
      };
      updatedCategories = addFieldToCategory(updatedCategories);
    }

    setSchema({ categories: updatedCategories });
  };  

  const getUncategorizedFields = () => {
    // Рекурсивно собираем все поля из всех категорий
    const getAllCategorizedFields = (categories: TemplateCategory[]): Set<string> => {
      const fieldSet = new Set<string>();
      
      const collectFields = (cats: TemplateCategory[]) => {
        cats.forEach(cat => {
          cat.fields.forEach(field => fieldSet.add(field));
          if (cat.categories) {
            collectFields(cat.categories);
          }
        });
      };
      
      collectFields(categories);
      return fieldSet;
    };

    const allFieldKeys = new Set(Object.keys(fields));
    const categorizedFields = getAllCategorizedFields(schema.categories);
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
              <button type="button" onClick={() => addCategory()} className={buttonStyles.button}>
                Добавить категорию
              </button>

              {schema.categories.map((category, index) => (
                <TemplateCategoryCard
                  key={category.key}
                  category={category}
                  index={index}
                  totalCategories={schema.categories.length}
                  depth={0}
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
                  onAddSubCategory={addCategory}
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