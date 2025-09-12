import React from 'react';
import { Group } from '../../types/group';
import buttonStyles from '../../styles/components/Button.module.css';
import styles from './GroupCard.module.css';

interface GroupCardProps {
  group: Group;
  onSelect: (group: Group) => void;
  showAction?: boolean;
  actionLabel?: string;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onSelect,
  showAction = true,
  actionLabel = 'Выбрать'
}) => {
  return (
    <div className={styles.groupCard}>
      {group.icon && (
        <img src={group.icon} alt={group.name} className={styles.groupIcon} />
      )}
      <h3 className={styles.groupName}>{group.name}</h3>
      {showAction && (
        <button 
          className={buttonStyles.button}
          onClick={() => onSelect(group)}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default GroupCard;