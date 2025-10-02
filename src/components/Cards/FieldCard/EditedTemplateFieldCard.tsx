import React from 'react';
import { TemplateField, TemplateCategory } from '../../../types/characterTemplates';
import IconButton from '../../commons/Buttons/IconButton/IconButton';
import inputStyles from '../../../styles/components/Input.module.css';
import styles from './EditedTemplateFieldCard.module.css';

interface EditedTemplateFieldCardProps {
  fieldKey: string;
  field: TemplateField;
  onEdit: (fieldKey: string) => void;
  onRemove: (fieldKey: string) => void;
  onMoveToCategory: (fieldKey: string, categoryKey: string) => void;
  categories: TemplateCategory[];
  selectedCategoryForField: string;
  onCategoryChange: (fieldKey: string, categoryKey: string) => void;
  currentCategoryKey?: string;
}

const EditedTemplateFieldCard: React.FC<EditedTemplateFieldCardProps> = ({
  fieldKey,
  field,
  onEdit,
  onRemove,
  onMoveToCategory,
  categories,
  selectedCategoryForField,
  onCategoryChange,
  currentCategoryKey
}) => {
  return (
    <div key={fieldKey} className={styles.fieldCard}>
      <div className={styles.fieldHeader}>
        <h4>{field?.name || 'Unknown Field'}</h4>
        <span className={styles.fieldKey}>({fieldKey})</span>
      </div>
      <p className={styles.fieldDescription}>{field?.description}</p>
      <p className={styles.fieldValue}>Значение по умолчанию: {field?.value}</p>
      {field.maxValue && (
        <p className={styles.fieldValue}>Максимум по умолчанию: {field.maxValue}</p>
      )}
      
      <div className={styles.fieldActions}>
        <IconButton 
          icon="edit" 
          onClick={() => onEdit(fieldKey)}
          title="Редактировать"
          size="small"
          variant="primary"
        />
        <IconButton 
          icon="delete" 
          onClick={() => onRemove(fieldKey)}
          title="Удалить"
          size="small"
          variant="danger"
        />
        <select
          value={selectedCategoryForField}
          onChange={(e) => {
            onCategoryChange(fieldKey, e.target.value);
            onMoveToCategory(fieldKey, e.target.value);
          }}
          className={inputStyles.input}
        >
          <option value="">Переместить в...</option>
          <option value="other">Другое</option>
          {categories
            .filter(c => !currentCategoryKey || c.key !== currentCategoryKey)
            .map(c => (
              <option key={c.key} value={c.key}>{c.name}</option>
            ))
          }
        </select>
      </div>
    </div>
  );
};

export default EditedTemplateFieldCard;