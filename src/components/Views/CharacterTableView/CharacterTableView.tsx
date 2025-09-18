// components/Views/CharacterTableView/CharacterTableView.tsx
import React from 'react';
import { Character } from '../../../types/characters';
import { CharacterTemplate } from '../../../types/characterTemplates';
import { categorizeCharacterFields, CategoryData } from '../../../utils/characterFields';
import CategoryTable from '../../Cards/CategoryCard/CategoryTable';
import styles from './CharacterTableView.module.css';

interface CharacterTableViewProps {
  character: Character;
  template: CharacterTemplate | null;
  canEdit: boolean;
  onUpdateFieldValue: (fieldKey: string, newValue: string) => void;
}

const CharacterTableView: React.FC<CharacterTableViewProps> = ({
  character,
  template,
  canEdit,
  onUpdateFieldValue
}) => {
  const categorizedFields = categorizeCharacterFields(character, template);

  return (
    <div className={styles.tableView}>
      {Object.values(categorizedFields).map(category => (
        <CategoryTable
          key={category.key}
          category={category}
          canEdit={canEdit}
          onUpdateFieldValue={onUpdateFieldValue}
        />
      ))}
    </div>
  );
};

export default CharacterTableView;