// components/Cards/SkillCard.tsx
import React, { useState } from 'react';
import { GroupSkill, SkillAttribute } from '../../../../types/groupSkills';
import IconButton from '../../../../components/commons/Buttons/IconButton/IconButton';
import styles from './SkillCard.module.css';
import ReactMarkdown from 'react-markdown';

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
    <div id={`skill-${skill.id}`} className={styles.skillCard}>
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
            <ReactMarkdown>{skill.description}</ReactMarkdown>
          </div>
          
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