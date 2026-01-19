// CharacterTemplates.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterTemplate, TemplateField, UpdateTemplateRequest } from '../../types/characterTemplates';
import { characterTemplatesAPI, groupAPI } from '../../services/api';
import commonStyles from '../../styles/common.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import uiStyles from '../../styles/ui.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import TemplatePreview from '../../components/Views/TemplatePreview/TemplatePreview';
import { TemplateSchema, TemplateCategory } from '../../types/groupSchemas';
import IconButton from '../../components/commons/Buttons/IconButton/IconButton';
import { TemplateEditProvider } from '../../contexts/TemplateEditContext';
import TemplateFieldModal from '../../components/Modals/CharacterFieldModal/TemplateFieldModal';
import CategoryModal from '../../components/Modals/CharacterModal/CategoryModal';

const CharacterTemplates: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [originalTemplate, setOriginalTemplate] = useState<CharacterTemplate | null>(null);
  const [originalSchema, setOriginalSchema] = useState<TemplateSchema | null>(null);
  
  // Локальные копии для редактирования
  const [editingTemplate, setEditingTemplate] = useState<CharacterTemplate | null>(null);
  const [editingSchema, setEditingSchema] = useState<TemplateSchema | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const { canEditTemplates } = useActionPermissions();

  // Состояния для модальных окон
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [currentEditingCategory, setCurrentEditingCategory] = useState<{
    category: TemplateCategory | null; 
    parentKey?: string;
    isRoot?: boolean;
  }>({ category: null });
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<{ field: TemplateField | null; fieldKey: string }>({ field: null, fieldKey: '' });

  // Рефы для сохранения значений перед редактированием
  const templateBeforeEdit = useRef<CharacterTemplate | null>(null);
  const schemaBeforeEdit = useRef<TemplateSchema | null>(null);

  useEffect(() => {
    if (groupId) {
      loadTemplate();
    }
  }, [groupId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const templatesData = await characterTemplatesAPI.getTemplates(parseInt(groupId!));
      if (templatesData.length > 0) {
        setOriginalTemplate(templatesData[0]);
        setEditingTemplate(templatesData[0]);
      } else {
        setOriginalTemplate(null);
        setEditingTemplate(null);
      }
      const templateSchema = await groupAPI.getTemplateSchema(groupId ? Number(groupId) : 0);
      setOriginalSchema(templateSchema);
      setEditingSchema(templateSchema);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const newTemplate = await characterTemplatesAPI.createTemplate(parseInt(groupId!), {
        name: 'Новый шаблон',
        description: '',
        fields: {}
      });
      setOriginalTemplate(newTemplate);
      setEditingTemplate(newTemplate);
      setEditMode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  // Вход в режим редактирования
  const handleEnterEditMode = () => {
    if (!editingTemplate || !editingSchema) return;
    
    // Сохраняем текущие состояния для возможной отмены
    templateBeforeEdit.current = JSON.parse(JSON.stringify(editingTemplate));
    schemaBeforeEdit.current = JSON.parse(JSON.stringify(editingSchema));
    setEditMode(true);
  };

  // Выход из режима редактирования без сохранения
  const handleCancelEdit = () => {
    if (templateBeforeEdit.current) {
      setEditingTemplate(templateBeforeEdit.current);
    }
    if (schemaBeforeEdit.current) {
      setEditingSchema(schemaBeforeEdit.current);
    }
    setEditMode(false);
  };

  // Сохранение всех изменений
  const handleSaveAllChanges = async () => {
    if (!editingTemplate || !editingSchema) return;

    try {
      setSaving(true);
      setError(null);

      // 1. Сохраняем шаблон (все поля)
      const templateUpdateData: UpdateTemplateRequest = {
        name: editingTemplate.name,
        description: editingTemplate.description,
        fields: editingTemplate.fields
      };

      await characterTemplatesAPI.updateTemplate(
        parseInt(groupId!), 
        editingTemplate.id, 
        templateUpdateData
      );

      // 2. Сохраняем схему
      await groupAPI.updateTemplateSchema(
        Number(groupId), 
        editingSchema
      );

      // Обновляем оригинальные данные
      setOriginalTemplate(editingTemplate);
      setOriginalSchema(editingSchema);
      setEditMode(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Обработчики для категорий
  const handleAddCategory = (parentCategoryKey?: string) => {
    setCurrentEditingCategory({ 
      category: null, 
      parentKey: parentCategoryKey,
      isRoot: !parentCategoryKey
    });
    setIsCategoryModalOpen(true);
  };

  const handleAddRootCategory = () => {
    handleAddCategory(undefined); // undefined означает корневую категорию
  };

  const handleEditCategory = (categoryKey: string) => {
    if (!editingSchema) return;
    
    const findCategoryInSchema = (categories: TemplateCategory[], key: string): {
      category: TemplateCategory | null; 
      parentKey?: string;
    } => {
      for (const category of categories) {
        if (category.name === key) {
          return { category };
        }
        if (category.categories) {
          const found = findCategoryInSchema(category.categories, key);
          if (found.category) {
            return { category: found.category, parentKey: category.name };
          }
        }
      }
      return { category: null };
    };

    const result = findCategoryInSchema(editingSchema.categories, categoryKey);
    if (result.category) {
      setCurrentEditingCategory(result);
      setIsCategoryModalOpen(true);
    }
  };

  const handleDeleteCategory = (categoryKey: string) => {
    if (!editingSchema || !window.confirm(`Удалить категорию "${categoryKey}"? Все поля в этой категории будут перемещены в "Другое".`)) {
      return;
    }

    const removeCategoryFromSchema = (categories: TemplateCategory[], categoryName: string): TemplateCategory[] => {
      return categories
        .filter(category => category.name !== categoryName)
        .map(category => ({
          ...category,
          categories: category.categories ? removeCategoryFromSchema(category.categories, categoryName) : []
        }));
    };

    const updatedCategories = removeCategoryFromSchema(editingSchema.categories, categoryKey);
    setEditingSchema({
      ...editingSchema,
      categories: updatedCategories
    });
  };

  const handleSaveCategory = (category: TemplateCategory) => {
    if (!editingSchema) return;
    
    console.log('Сохранение категории:', {
      category,
      currentEditingCategory,
      parentKey: currentEditingCategory.parentKey,
      isNew: !currentEditingCategory.category
    });

    const addOrUpdateCategory = (
      categories: TemplateCategory[], 
      newCategory: TemplateCategory,
      parentKey?: string
    ): TemplateCategory[] => {
      if (!parentKey) {
        // Добавление/обновление корневой категории
        const existingIndex = categories.findIndex(c => c.name === newCategory.name);
        if (existingIndex >= 0) {
          // Обновление существующей категории
          const updated = [...categories];
          updated[existingIndex] = newCategory;
          return updated;
        } else {
          // Добавление новой категории
          return [...categories, newCategory];
        }
      }
      
      // Добавление/обновление подкатегории
      return categories.map(cat => {
        if (cat.name === parentKey) {
          // Нашли родительскую категорию
          const existingIndex = (cat.categories || []).findIndex(c => c.name === newCategory.name);
          if (existingIndex >= 0) {
            // Обновление существующей подкатегории
            const updatedCategories = [...(cat.categories || [])];
            updatedCategories[existingIndex] = newCategory;
            return {
              ...cat,
              categories: updatedCategories
            };
          } else {
            // Добавление новой подкатегории
            return {
              ...cat,
              categories: [...(cat.categories || []), newCategory]
            };
          }
        }
        
        // Рекурсивно ищем родительскую категорию в подкатегориях
        if (cat.categories) {
          return {
            ...cat,
            categories: addOrUpdateCategory(cat.categories, newCategory, parentKey)
          };
        }
        
        return cat;
      });
    };
    
    const updatedCategories = addOrUpdateCategory(
      editingSchema.categories,
      category,
      currentEditingCategory.parentKey
    );
  
    setEditingSchema({
      ...editingSchema,
      categories: updatedCategories
    });
    
    setIsCategoryModalOpen(false);
    setCurrentEditingCategory({ category: null });
  };

  // Обработчики для полей
  const handleAddField = () => {
    setEditingField({ field: null, fieldKey: '' });
    setIsFieldModalOpen(true);
  };

  const handleEditField = (fieldKey: string) => {
    if (!editingTemplate) return;
    
    const field = editingTemplate.fields[fieldKey];
    if (field) {
      setEditingField({ field, fieldKey });
      setIsFieldModalOpen(true);
    }
  };

  const handleDeleteField = (fieldKey: string) => {
    if (!editingTemplate || !window.confirm(`Удалить поле "${editingTemplate.fields[fieldKey]?.name}"?`)) {
      return;
    }

    const updatedFields = { ...editingTemplate.fields };
    delete updatedFields[fieldKey];
    
    setEditingTemplate({
      ...editingTemplate,
      fields: updatedFields
    });
  };

  const handleSaveField = (field: TemplateField, fieldKey: string) => {
    if (!editingTemplate) return;
    
    let updatedFields = { ...editingTemplate.fields };
    
    if (editingField.field && editingField.fieldKey !== fieldKey) {
      // Если изменился ключ поля, удаляем старый и добавляем новый
      delete updatedFields[editingField.fieldKey];
    }
    
    updatedFields[fieldKey] = field;
    
    setEditingTemplate({
      ...editingTemplate,
      fields: updatedFields
    });
    
    setIsFieldModalOpen(false);
    setEditingField({ field: null, fieldKey: '' });
  };

  // Обновление названия и описания шаблона
  const handleUpdateTemplateInfo = (updates: { name?: string; description?: string }) => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      ...updates
    });
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  const handleMoveFieldToCategory = (fieldKey: string, targetCategoryKey: string) => {
    if (!editingTemplate || !editingSchema) return;
  
    console.log(`Перемещаем поле ${fieldKey} в категорию ${targetCategoryKey}`);
  
    // Находим поле
    const field = editingTemplate.fields[fieldKey];
    if (!field) return;
  
    // Определяем, является ли целевая категория "Другим"
    const isTargetOther = targetCategoryKey === 'other';
  
    if (isTargetOther) {
      // Если перемещаем в "Другое" - удаляем поле из всех категорий схемы
      const removeFieldFromAllCategories = (categories: TemplateCategory[]): TemplateCategory[] => {
        return categories.map(category => ({
          ...category,
          fields: category.fields.filter(f => f !== fieldKey),
          categories: category.categories ? removeFieldFromAllCategories(category.categories) : []
        }));
      };
  
      setEditingSchema({
        ...editingSchema,
        categories: removeFieldFromAllCategories(editingSchema.categories)
      });
    } else {
      // Находим целевую категорию в схеме
      const findCategory = (categories: TemplateCategory[], targetKey: string): TemplateCategory | null => {
        for (const category of categories) {
          if (category.name === targetKey) {
            return category;
          }
          if (category.categories) {
            const found = findCategory(category.categories, targetKey);
            if (found) return found;
          }
        }
        return null;
      };
  
      // Удаляем поле из всех категорий
      const removeFieldFromAllCategories = (categories: TemplateCategory[]): TemplateCategory[] => {
        return categories.map(category => ({
          ...category,
          fields: category.fields.filter(f => f !== fieldKey),
          categories: category.categories ? removeFieldFromAllCategories(category.categories) : []
        }));
      };
  
      // Добавляем поле в целевую категорию
      const addFieldToCategory = (categories: TemplateCategory[], targetKey: string): TemplateCategory[] => {
        return categories.map(category => {
          if (category.name === targetKey) {
            return {
              ...category,
              fields: [...category.fields, fieldKey]
            };
          }
          if (category.categories) {
            return {
              ...category,
              categories: addFieldToCategory(category.categories, targetKey)
            };
          }
          return category;
        });
      };
  
      // Сначала удаляем поле из всех категорий, затем добавляем в целевую
      let updatedCategories = removeFieldFromAllCategories(editingSchema.categories);
      updatedCategories = addFieldToCategory(updatedCategories, targetCategoryKey);
  
      setEditingSchema({
        ...editingSchema,
        categories: updatedCategories
      });
    }
  };
  
  // Обновляем templateEditContextValue:
  const templateEditContextValue = {
    editMode,
    onAddField: handleAddField,
    onAddCategory: handleAddCategory,
    onDeleteField: handleDeleteField,
    onDeleteCategory: handleDeleteCategory,
    onEditField: handleEditField,
    onEditCategory: handleEditCategory,
    onMoveFieldToCategory: handleMoveFieldToCategory,
  };

  return (
    <div className={commonStyles.container}>
      <div className={uiStyles.actions} style={{ marginBottom: '1.5rem' }}>
        {editMode ? (
          <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center' }}>
            <input
              type="text"
              value={editingTemplate?.name || ''}
              onChange={(e) => handleUpdateTemplateInfo({ name: e.target.value })}
              style={{ flex: 1, padding: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={buttonStyles.button}
                onClick={handleSaveAllChanges}
                disabled={saving}
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <IconButton 
                title="Отменить редактирование"
                icon="close"
                onClick={handleCancelEdit}
              />
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ margin: 0, marginRight: 'auto' }}>
              {originalTemplate?.name || 'Шаблон персонажей'}
            </h1>
            {canEditTemplates && originalTemplate && (
              <IconButton 
                title="Редактировать шаблон"
                icon="edit"
                onClick={handleEnterEditMode}
              />
            )}
          </>
        )}
      </div>

      {editMode && editingTemplate && (
        <div style={{ marginBottom: '1rem' }}>
          <textarea
            value={editingTemplate.description}
            onChange={(e) => handleUpdateTemplateInfo({ description: e.target.value })}
            style={{ width: '100%', minHeight: '80px', padding: '0.5rem' }}
            placeholder="Описание шаблона..."
          />
        </div>
      )}

      {error && <div className={commonStyles.error}>{error}</div>}

      {/* Кнопка добавления корневой категории */}
      {editMode && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className={buttonStyles.button}
            onClick={handleAddRootCategory}
          >
            + Добавить корневую категорию
          </button>
          <button 
            className={buttonStyles.button}
            onClick={handleAddField}
          >
            + Добавить поле (без категории)
          </button>
        </div>
      )}

      {originalTemplate ? (
        <TemplateEditProvider value={templateEditContextValue}>
          <TemplatePreview 
            template={editMode && editingTemplate ? editingTemplate : originalTemplate} 
            schema={editMode && editingSchema ? editingSchema : (originalSchema || {categories: []})} 
          />
        </TemplateEditProvider>
      ) : (
        <div className={commonStyles.card}>
          <p>Шаблон ещё не создан</p>
          {canEditTemplates && (
            <button 
              className={buttonStyles.button}
              onClick={handleCreateTemplate}
            >
              Создать шаблон
            </button>
          )}
        </div>
      )}

      {/* Модальные окна */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCurrentEditingCategory({ category: null });
        }}
        onSave={handleSaveCategory}
        category={currentEditingCategory.category}
        title={currentEditingCategory.category ? 'Редактирование категории' : 
               currentEditingCategory.isRoot ? 'Создание корневой категории' : 'Создание подкатегории'}
      />

      <TemplateFieldModal
        isOpen={isFieldModalOpen}
        onClose={() => {
          setIsFieldModalOpen(false);
          setEditingField({ field: null, fieldKey: '' });
        }}
        onSave={handleSaveField}
        field={editingField.field}
        fieldKey={editingField.fieldKey}
        title={editingField.field ? 'Редактирование поля' : 'Создание поля'}
      />
    </div>
  );
};

export default CharacterTemplates;