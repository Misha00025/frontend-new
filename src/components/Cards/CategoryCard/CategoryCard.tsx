import React, { useState, useMemo } from 'react';
import { CharacterField } from '../../../types/characters';
import { CharacterTemplate } from '../../../types/characterTemplates';
import List from '../../List/List';
import FieldCard from '../FieldCard/FieldCard';
import IconButton from '../../Buttons/IconButton';
import styles from './CategoryCard.module.css';

interface CategoryCardProps {
  title: string;
  fields: [string, CharacterField, boolean][];
  canEdit: boolean;
  template?: CharacterTemplate | null;
  onEdit: (fieldKey: string, field: CharacterField) => void;
  onDelete: (fieldKey: string) => void;
  onChangeCategory: (fieldKey: string, newCategory: string) => void;
}

type SortOrder = 'none' | 'asc' | 'desc';

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  fields,
  canEdit,
  template,
  onEdit,
  onDelete,
  onChangeCategory
}) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  
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

  if (fields.length === 0) return null;

  return (
    <div className={styles.categorySection}>
      <div className={styles.categoryHeader}>
        <h3>{title}</h3>
        <IconButton
          icon={getSortIcon()}
          title={getSortTitle()}
          onClick={handleSortToggle}
        />
      </div>
      <List layout="grid" gap="medium">
        {sortedFields.map(([key, field, isStatic]) => (
          <FieldCard
            key={key}
            fieldKey={key}
            field={field}
            canEdit={canEdit}
            canEditCategory = {!isStatic && canEdit}
            template={template}
            onEdit={onEdit}
            onDelete={onDelete}
            onChangeCategory={onChangeCategory}
          />
        ))}
      </List>
    </div>
  );
};

export default CategoryCard;