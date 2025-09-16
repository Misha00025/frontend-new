import React from 'react';
import { CharacterField } from '../../../types/characters';
import { CharacterTemplate } from '../../../types/characterTemplates';
import List from '../../List/List';
import FieldCard from '../FieldCard/FieldCard';
import styles from './CategoryCard.module.css';

interface CategoryCardProps {
  title: string;
  fields: [string, CharacterField][];
  canEdit: boolean;
  template?: CharacterTemplate | null;
  onEdit: (fieldKey: string, field: CharacterField) => void;
  onDelete: (fieldKey: string) => void;
  onChangeCategory: (fieldKey: string, newCategory: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  fields,
  canEdit,
  template,
  onEdit,
  onDelete,
  onChangeCategory
}) => {
  if (fields.length === 0) return null;

  return (
    <div className={styles.categorySection}>
      <h3>{title}</h3>
      <List layout="grid" gap="medium">
        {fields.map(([key, field]) => (
          <FieldCard
            key={key}
            fieldKey={key}
            field={field}
            canEdit={canEdit}
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