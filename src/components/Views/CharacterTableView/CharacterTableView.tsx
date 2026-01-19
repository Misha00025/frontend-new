// components/Views/CharacterTableView/CharacterTableView.tsx
import React, { useState } from 'react';
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
  const [isOtherDragOver, setIsOtherDragOver] = useState(false);
  const categorizedFields = categorizeCharacterFields(character, schema);

  // Если нет категорий, не отображаем таблицу
  if (Object.keys(categorizedFields).length === 0) {
    return null;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOtherDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setIsOtherDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOtherDragOver(false);
    
    const fieldKey = e.dataTransfer.getData('text/plain');
    if (fieldKey && categorizedFields.other) {
      // Обработка будет в родительском компоненте через контекст
      console.log(`Перемещаем поле ${fieldKey} в "Другое"`);
    }
  };

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
      
      {/* Специальная зона для "Другого", если её нет в categorizedFields */}
      {!categorizedFields.other && canEdit && (
        <div 
          className={`${styles.otherDropZone} ${isOtherDragOver ? styles.dragOver : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <h3 className={styles.otherTitle}>
            Перетащите поле сюда, чтобы переместить в "Другое"
          </h3>
        </div>
      )}
    </div>
  );
};

export default CharacterTableView;