import React from 'react';
import { TemplateField } from '../../../types/characterTemplates';
import buttonStyles from '../../../styles/components/Button.module.css';
import styles from './TemplateCategoryCard.module.css';
import IconButton from '../../commons/Buttons/IconButton/IconButton';
import EditedTemplateFieldCard from '../../Cards/FieldCard/EditedTemplateFieldCard';
import { TemplateCategory } from '../../../types/groupSchemas';

interface TemplateCategoryCardProps {
  category: TemplateCategory;
  index: number;
  totalCategories: number;
  depth: number;
  fields: Record<string, TemplateField>;
  selectedCategoryForField: Record<string, string>;
  onAddFieldToTemplate: (field: TemplateField) => string;
  onEditCategory: (category: TemplateCategory, parentCategory?: TemplateCategory) => void;
  onRemoveCategory: (categoryKey: string, parentCategory?: TemplateCategory) => void;
  onMoveCategoryUp: (index: number, parentCategory?: TemplateCategory) => void;
  onMoveCategoryDown: (index: number, parentCategory?: TemplateCategory) => void;
  onEditField: (fieldKey: string) => void;
  onRemoveField: (fieldKey: string) => void;
  onMoveFieldToCategory: (fieldKey: string, categoryKey: string) => void;
  onCategoryChange: (fieldKey: string, categoryKey: string) => void;
  onUpdateCategory: (updatedCategory: TemplateCategory, parentCategory?: TemplateCategory) => void;
  onAddSubCategory: (parentCategory: TemplateCategory) => void;
  parentCategory?: TemplateCategory;
  maxDepth?: number;
}

const TemplateCategoryCard: React.FC<TemplateCategoryCardProps> = ({
  category,
  index,
  totalCategories,
  depth = 0,
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
  onAddSubCategory,
  parentCategory,
  maxDepth = 2,
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
    
    onUpdateCategory(updatedCategory, parentCategory);
  };

  const handleAddSubCategory = () => {
    onAddSubCategory(category);
  };

  const handleEditCategory = () => {
    onEditCategory(category, parentCategory);
  };

  const handleRemoveCategory = () => {
    onRemoveCategory(category.name, parentCategory);
  };

  const handleMoveUp = () => {
    onMoveCategoryUp(index, parentCategory);
  };

  const handleMoveDown = () => {
    onMoveCategoryDown(index, parentCategory);
  };

  const canAddSubCategory = depth < maxDepth - 1;

  return (
    <div className={`${styles.categoryCard} ${styles[`depth-${depth}`]}`}>
      <div className={styles.categoryHeader}>
        <h4>{category.name}</h4>
        <div className={styles.categoryActions}>
          {index > 0 && (
            <IconButton 
              icon="arrow-up" 
              onClick={handleMoveUp}
              title="Переместить вверх"
              size="small"
              variant="primary"
            />
          )}
          {index < totalCategories - 1 && (
            <IconButton 
              icon="arrow-down" 
              onClick={handleMoveDown}
              title="Переместить вниз"
              size="small"
              variant="primary"
            />
          )}
          <IconButton 
            icon="edit" 
            onClick={handleEditCategory}
            title="Редактировать категорию"
            size="small"
            variant="primary"
          />
          {canAddSubCategory && (
            <IconButton 
              icon="add" 
              onClick={handleAddSubCategory}
              title="Добавить подкатегорию"
              size="small"
              variant="primary"
            />
          )}
          <IconButton 
            icon="delete" 
            onClick={handleRemoveCategory}
            title="Удалить категорию"
            size="small"
            variant="danger"
          />
        </div>
      </div>
      
      <div className={styles.categoryContent}>
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
            categories={category.categories ? category.categories : []}
            selectedCategoryForField={selectedCategoryForField[fieldKey] || ''}
            onCategoryChange={onCategoryChange}
            currentCategoryKey={category.name}
          />
        ))}

        {category.categories && category.categories.length > 0 && (
          <div className={styles.subCategories}>
            {category.categories.map((subCategory, subIndex) => (
              <TemplateCategoryCard
                key={subCategory.name}
                category={subCategory}
                index={subIndex}
                totalCategories={category.categories!.length}
                depth={depth + 1}
                fields={fields}
                selectedCategoryForField={selectedCategoryForField}
                onAddFieldToTemplate={onAddFieldToTemplate}
                onEditCategory={onEditCategory}
                onRemoveCategory={onRemoveCategory}
                onMoveCategoryUp={onMoveCategoryUp}
                onMoveCategoryDown={onMoveCategoryDown}
                onEditField={onEditField}
                onRemoveField={onRemoveField}
                onMoveFieldToCategory={onMoveFieldToCategory}
                onCategoryChange={onCategoryChange}
                onUpdateCategory={onUpdateCategory}
                onAddSubCategory={onAddSubCategory}
                parentCategory={category}
                maxDepth={maxDepth}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateCategoryCard;