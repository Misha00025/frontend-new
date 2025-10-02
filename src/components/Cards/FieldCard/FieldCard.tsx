import React from 'react';
import { CharacterField } from '../../../types/characters';
import { CharacterTemplate } from '../../../types/characterTemplates';
import IconButton from '../../commons/Buttons/IconButton/IconButton';
import styles from './FieldCard.module.css';

interface FieldCardProps {
  fieldKey: string;
  field: CharacterField;
  canEdit: boolean;
  canEditCategory?: boolean;
  template?: CharacterTemplate | null;
  onEdit: (fieldKey: string, field: CharacterField) => void;
  onDelete: (fieldKey: string) => void;
  onChangeCategory: (fieldKey: string, newCategory: string) => void;
}

const FieldCard: React.FC<FieldCardProps> = ({
  fieldKey,
  field,
  canEdit,
  canEditCategory = canEdit,
  template,
  onEdit,
  onDelete,
  onChangeCategory
}) => {
  return (
    <div className={styles.fieldCard}>
      <div className={styles.fieldContent}>
        <div className={styles.fieldHeader}>
          <h4>{field.name}</h4>
        </div>
        {/* {field.description && <p className={styles.fieldDescription}>{field.description}</p>} */}
        <div className={styles.fieldValue}>
          {field.maxValue !== undefined ? (
            <div className={styles.progressContainer}>
              <div 
                className={styles.progressBar}
                style={{ 
                  width: `${(field.value / field.maxValue) * 100}%`,
                  backgroundColor: `hsl(${(field.value / field.maxValue) * 120}, 70%, 45%)`
                }}
              >
                <span className={styles.progressText}>
                  {field.value}/{field.maxValue}
                </span>
              </div>
            </div>
          ) : (
            <>
              <strong>Значение:</strong> {field.value}
            </>
          )}
        </div>
      </div>
      {canEdit && (
        <div className={styles.actionsContainer}>
          
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
              variant='danger'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldCard;