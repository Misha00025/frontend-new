import React, { useState, useMemo } from 'react';
import { CharacterField } from '../../../types/characters';
import { CharacterTemplate } from '../../../types/characterTemplates';
import List from '../../List/List';
import FieldCard from '../FieldCard/FieldCard';
import IconButton from '../../commons/Buttons/IconButton/IconButton';
import styles from './CategoryCard.module.css';
import { TemplateCategory } from '../../../types/groupSchemas';

interface CategoryCardProps {
  title: string;
  categoryKey: string;
  fields: [string, CharacterField, boolean][];
  subcategories?: TemplateCategory[];
  allFields: Record<string, CharacterField>;
  canEdit: boolean;
  template?: CharacterTemplate | null;
  onEdit: (fieldKey: string, field: CharacterField) => void;
  onDelete: (fieldKey: string) => void;
  onChangeCategory: (fieldKey: string, newCategory: string) => void;
  level?: number;
}

type SortOrder = 'none' | 'asc' | 'desc';

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  categoryKey,
  fields,
  subcategories,
  allFields,
  canEdit,
  template,
  onEdit,
  onDelete,
  onChangeCategory,
  level = 0
}) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [isExpanded, setIsExpanded] = useState(true);
  
  const sortedFields = useMemo(() => {
    if (sortOrder === 'none') return fields;
    
    return [...fields].sort((a, b) => {
      const valueA = a[1].value?.toString().toLowerCase() || '';
      const valueB = b[1].value?.toString().toLowerCase() || '';
      
      if (sortOrder === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  }, [fields, sortOrder]);

  const handleSortToggle = () => {
    setSortOrder(prev => {
      if (prev === 'none') return 'desc';
      if (prev === 'desc') return 'asc';
      return 'none';
    });
  };

  const getSortIcon = () => {
    if (sortOrder === 'none') return 'sort';
    if (sortOrder === 'asc') return 'sort-up';
    return 'sort-down';
  };

  const getSortTitle = () => {
    if (sortOrder === 'none') return 'Сортировать по значению';
    if (sortOrder === 'asc') return 'Сортировка по возрастанию';
    return 'Сортировка по убыванию';
  };

  // Функция для подготовки полей подкатегорий
  const getSubcategoryFields = (subcategory: TemplateCategory): [string, CharacterField, boolean][] => {
    return subcategory.fields
      .filter(key => allFields[key])
      .map(key => [key, allFields[key], true]);
  };

  // Отображаем категорию, даже если в ней нет полей, но есть подкатегории
  const hasContent = fields.length > 0 || (subcategories && subcategories.length > 0);
  if (!hasContent) return null;

  return (
    <div className={`${styles.categorySection} ${level > 0 ? styles.subcategory : ''}`} data-level={level}>
      <div className={styles.categoryHeader}>
        <div className={styles.categoryTitle}>
          {subcategories && subcategories.length > 0 && (
            <button 
              className={styles.expandButton}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? '▼' : '►'}
            </button>
          )}
          <h3>{title}</h3>
        </div>
        {fields.length > 0 && (
          <IconButton
            icon={getSortIcon()}
            title={getSortTitle()}
            onClick={handleSortToggle}
          />
        )}
      </div>
      
      {isExpanded && (
        <>
          {fields.length > 0 && (
            <List layout="grid" gap="medium">
              {sortedFields.map(([key, field, isStatic]) => (
                <FieldCard
                  key={key}
                  fieldKey={key}
                  field={field}
                  canEdit={canEdit}
                  canEditCategory={!isStatic && canEdit}
                  template={template}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onChangeCategory={onChangeCategory}
                />
              ))}
            </List>
          )}
          
          {subcategories && subcategories.map(subcategory => (
            <CategoryCard
              key={subcategory.name}
              title={subcategory.name}
              categoryKey={subcategory.name}
              fields={getSubcategoryFields(subcategory)}
              subcategories={subcategory.categories}
              allFields={allFields}
              canEdit={canEdit}
              template={template}
              onEdit={onEdit}
              onDelete={onDelete}
              onChangeCategory={onChangeCategory}
              level={level + 1}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default CategoryCard;