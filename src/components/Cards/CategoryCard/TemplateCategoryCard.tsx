import React from 'react';
import { TemplateCategory, TemplateField } from '../../../types/characterTemplates';
import buttonStyles from '../../../styles/components/Button.module.css';
import styles from './TemplateCategoryCard.module.css';
import IconButton from '../../Buttons/IconButton';
import EditedTemplateFieldCard from '../../Cards/FieldCard/EditedTemplateFieldCard';

interface TemplateCategoryCardProps {
  category: TemplateCategory;
  index: number;
  totalCategories: number;
  fields: Record<string, TemplateField>;
  selectedCategoryForField: Record<string, string>;
  onAddFieldToTemplate: (field: TemplateField) => string; // Возвращает ID созданного поля
  onEditCategory: (category: TemplateCategory) => void;
  onRemoveCategory: (categoryKey: string) => void;
  onMoveCategoryUp: (index: number) => void;
  onMoveCategoryDown: (index: number) => void;
  onEditField: (fieldKey: string) => void;
  onRemoveField: (fieldKey: string) => void;
  onMoveFieldToCategory: (fieldKey: string, categoryKey: string) => void;
  onCategoryChange: (fieldKey: string, categoryKey: string) => void;
  onUpdateCategory: (updatedCategory: TemplateCategory) => void;
}

const TemplateCategoryCard: React.FC<TemplateCategoryCardProps> = ({
  category,
  index,
  totalCategories,
  fields,
  selectedCategoryForField,
  onAddFieldToTemplate,
  onEditCategory,
  onRemoveCategory,
  onMoveCategoryUp,
  onMoveCategoryDown,
  onEditField,
  onRemoveField,
  onMoveFieldToCategory,
  onCategoryChange,
  onUpdateCategory,
}) => {
  const handleAddField = () => {
    const fieldName = `Новое поле ${Object.keys(fields).length + 1}`;
    
    const newField = {
      name: fieldName,
      value: 0,
      description: '',
    };

    const fieldKey = onAddFieldToTemplate(newField);
    
    const updatedCategory = {
      ...category,
      fields: [...category.fields, fieldKey]
    };
    
    onUpdateCategory(updatedCategory);
    // onEditField(fieldKey);
  };

  return (
    <div className={styles.categoryCard}>
      <div className={styles.categoryHeader}>
        <h4>{category.name}</h4>
        <div className={styles.categoryActions}>
          {index > 0 && (
            <IconButton 
              icon="arrow-up" 
              onClick={() => onMoveCategoryUp(index)}
              title="Переместить вверх"
              size="small"
              variant="primary"
            />
          )}
          {index < totalCategories - 1 && (
            <IconButton 
              icon="arrow-down" 
              onClick={() => onMoveCategoryDown(index)}
              title="Переместить вниз"
              size="small"
              variant="primary"
            />
          )}
          <IconButton 
            icon="edit" 
            onClick={() => onEditCategory(category)}
            title="Редактировать категорию"
            size="small"
            variant="primary"
          />
          <IconButton 
            icon="delete" 
            onClick={() => onRemoveCategory(category.key)}
            title="Удалить категорию"
            size="small"
            variant="danger"
          />
        </div>
      </div>
      
      <button 
        type="button" 
        onClick={handleAddField}
        className={buttonStyles.button}
      >
        Добавить поле в категорию
      </button>

      {category.fields.map(fieldKey => (
        <EditedTemplateFieldCard
          key={fieldKey}
          fieldKey={fieldKey}
          field={fields[fieldKey]}
          onEdit={onEditField}
          onRemove={onRemoveField}
          onMoveToCategory={onMoveFieldToCategory}
          categories={[]}
          selectedCategoryForField={selectedCategoryForField[fieldKey] || ''}
          onCategoryChange={onCategoryChange}
          currentCategoryKey={category.key}
        />
      ))}
    </div>
  );
};

export default TemplateCategoryCard;