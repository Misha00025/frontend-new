// components/Views/CharacterTableView/CharacterTableView.tsx
import React from 'react';
import { Character, CharacterField } from '../../../types/characters';
import { CharacterTemplate } from '../../../types/characterTemplates';
import { categorizeCharacterFields, CategoryData } from '../../../utils/characterFields';
import CategoryTable from '../../Cards/CategoryCard/CategoryTable';
import styles from './CharacterTableView.module.css';
import { TemplateSchema } from '../../../types/groupSchemas';

interface CharacterTableViewProps {
  character: Character;
  template: CharacterTemplate | null;
  schema: TemplateSchema | null;
  canEdit: boolean;
  onUpdateFieldValue: (fieldKey: string, newValue: string) => void;
  onAddField?: (category?:string) => void;
}

const CharacterTableView: React.FC<CharacterTableViewProps> = ({
  character,
  template,
  schema,
  canEdit,
  onUpdateFieldValue,
  onAddField = undefined
}) => {
  const categorizedFields = categorizeCharacterFields(character, schema);

  return (
    <div className={styles.tableView}>
      {Object.values(categorizedFields).map(category => (
        <CategoryTable
          key={category.key}
          category={category}
          canEdit={canEdit}
          onUpdateFieldValue={onUpdateFieldValue}
          onAddField={onAddField}
        />
      ))}
    </div>
  );
};

export default CharacterTableView;