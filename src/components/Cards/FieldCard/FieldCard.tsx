import React from 'react';
import { CharacterField } from '../../../types/characters';
import { CharacterTemplate } from '../../../types/characterTemplates';
import IconButton from '../../Buttons/IconButton';
import styles from './FieldCard.module.css';

interface FieldCardProps {
  fieldKey: string;
  field: CharacterField;
  canEdit: boolean;
  template?: CharacterTemplate | null;
  onEdit: (fieldKey: string, field: CharacterField) => void;
  onDelete: (fieldKey: string) => void;
  onChangeCategory: (fieldKey: string, newCategory: string) => void;
}

const FieldCard: React.FC<FieldCardProps> = ({
  fieldKey,
  field,
  canEdit,
  template,
  onEdit,
  onDelete,
  onChangeCategory
}) => {
  return (
    <div className={styles.fieldCard}>
      <div className={styles.fieldHeader}>
        <h4>{field.name}</h4>
        <span className={styles.fieldKey}>({fieldKey})</span>
      </div>
      {field.description && <p className={styles.fieldDescription}>{field.description}</p>}
      <div className={styles.fieldValue}>
        <strong>Значение:</strong> {field.value}
      </div>
      {canEdit && (
        
        <div>
          {template && (
            <select
              value={field.category || 'other'}
              onChange={(e) => onChangeCategory(fieldKey, e.target.value)}
              className={styles.categorySelect}
            >
              <option value="other">Другое</option>
              {template.schema.categories.map(category => (
                <option key={category.key} value={category.key}>{category.name}</option>
              ))}
            </select>
          )}
          <div className={styles.fieldActions}>
            <IconButton
              title='Редактировать'
              icon='edit' 
              onClick={() => onEdit(fieldKey, field)}
            />
            <IconButton
              title='Удалить'
              icon='delete'
              onClick={() => onDelete(fieldKey)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldCard;