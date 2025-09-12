import React from 'react';
import { CharacterTemplate } from '../../types/characterTemplates';
import buttonStyles from '../../styles/components/Button.module.css';
import styles from './TemplateCard.module.css';

interface TemplateCardProps {
  template: CharacterTemplate;
  onEdit: () => void;
  onDelete: () => void;
  showActions?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  showActions = true
}) => {
  return (
    <div className={styles.templateCard}>
      <h3 className={styles.templateName}>{template.name}</h3>
      <p className={styles.templateDescription}>{template.description}</p>
      
      <div className={styles.fields}>
        <h4>Поля шаблона:</h4>
        {Object.entries(template.fields).map(([key, field]) => (
          <div key={key} className={styles.field}>
            <span className={styles.fieldName}>{field.name}</span>
            <span className={styles.fieldKey}>({key})</span>
            <span className={styles.fieldValue}>: {field.value}</span>
            {field.description && (
              <span className={styles.fieldDescription}> - {field.description}</span>
            )}
          </div>
        ))}
      </div>
      
      {showActions && (
        <div className={styles.templateActions}>
          <button className={buttonStyles.button} onClick={onEdit}>
            Редактировать
          </button>
          <button className={buttonStyles.button} onClick={onDelete}>
            Удалить
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateCard;