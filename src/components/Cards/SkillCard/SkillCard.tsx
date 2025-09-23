// components/Cards/SkillCard.tsx
import React, { useState } from 'react';
import { GroupSkill, SkillAttribute } from '../../../types/groupSkills';
import IconButton from '../../Buttons/IconButton';
import styles from './SkillCard.module.css';

interface SkillCardProps {
  skill: GroupSkill;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.skillCard}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.titleSection}>
          <h3 className={styles.skillName} title={skill.name}>{skill.name}</h3>
          <div className={styles.attributesPreview}>
            {skill.attributes.map(attr => (
              <span key={attr.key} className={styles.attributeTag}>
                {attr.name}: {attr.value}
              </span>
            ))}
          </div>
        </div>
        <button 
          className={styles.expandButton}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      
      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.description}>
            <p>{skill.description}</p>
          </div>
          
          {/* <div className={styles.attributesDetails}>
            <h4>Атрибуты:</h4>
            {skill.attributes.map((attr: SkillAttribute) => (
              <div key={attr.key} className={styles.attribute}>
                <span className={styles.attributeName}>{attr.name}</span>
                <span className={styles.attributeValue}>{attr.value}</span>
                {attr.description && (
                  <p className={styles.attributeDescription}>{attr.description}</p>
                )}
              </div>
            ))}
          </div> */}
          
          {showActions && (
            <div className={styles.actions}>
              {onEdit && (
                <IconButton 
                  icon="edit" 
                  onClick={onEdit}
                  title="Редактировать"
                  size="small"
                  variant="primary"
                />
              )}
              {onDelete && (
                <IconButton 
                  icon="delete" 
                  onClick={onDelete}
                  title="Удалить"
                  size="small"
                  variant="danger"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillCard;