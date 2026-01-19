// components/Views/CharacterTableView/CharacterTableView.tsx
import React from 'react';
import { Character } from '../../../types/characters';
import { CharacterTemplate } from '../../../types/characterTemplates';
import { categorizeCharacterFields, CategoryData } from '../../../utils/characterFields';
import CategoryTable from '../../Cards/CategoryCard/CategoryTable';
import styles from './CharacterTableView.module.css';
import { TemplateSchema } from '../../../types/groupSchemas';
import { MenuItem } from '../../control/DropdownMenu/DropdownMenu';

interface CharacterTableViewProps {
  character: Character;
  template: CharacterTemplate | null;
  schema: TemplateSchema | null;
  canEdit: boolean;
  onUpdateFieldValue: (fieldKey: string, newValue: string) => void;
  getCategoryMenuItems?: (category: CategoryData) => MenuItem[];
}

const CharacterTableView: React.FC<CharacterTableViewProps> = ({
  character,
  schema,
  canEdit,
  onUpdateFieldValue,
  getCategoryMenuItems,
}) => {
  const categorizedFields = categorizeCharacterFields(character, schema);

  // Если нет категорий, не отображаем таблицу
  if (Object.keys(categorizedFields).length === 0) {
    return null;
  }

  return (
    <div className={styles.tableView}>
      {Object.values(categorizedFields).map(category => (
        <CategoryTable
          key={category.key}
          category={category}
          canEdit={canEdit}
          onUpdateFieldValue={onUpdateFieldValue}
          categoryMenuItems={getCategoryMenuItems ? getCategoryMenuItems(category) : undefined}
        />
      ))}
    </div>
  );
};

export default CharacterTableView;