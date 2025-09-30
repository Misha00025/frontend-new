import React from 'react';
import { CharacterShort } from '../../types/characters';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import styles from './CharacterCard.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import IconButton from '../Buttons/IconButton';
import { Link, useParams } from 'react-router-dom';

interface CharacterCardProps {
  character: CharacterShort;
  onSelect: () => void;
  showAction?: boolean;
  actionLabel?: string;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  showAction = true,
  actionLabel = 'Выбрать'
}) => {
  const { canEditGroup } = useActionPermissions();
  const { groupId } = useParams<{ groupId: string }>();
  return (
    <div className={styles.characterCard}>
      <h3 className={styles.characterName}>{character.name}</h3>
      <p className={styles.characterDescription}>{character.description}</p>
      
      {showAction && (
        <div>
          <button 
            className={buttonStyles.button}
            onClick={onSelect}
          >
            {actionLabel}
          </button>
          {canEditGroup && (<Link 
            to={`/group/${groupId}/character/${character.id}/users`}
            className={` ${commonStyles.link}`}
          >
            Игроки
          </Link>)}
        </div>
      )}
    </div>
  );
};

export default CharacterCard;