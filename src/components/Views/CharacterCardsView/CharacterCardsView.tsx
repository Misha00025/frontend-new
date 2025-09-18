// components/Views/CharacterCardsView/CharacterCardsView.tsx
import React from 'react';
import { Character, CharacterField } from '../../../types/characters';
import { CharacterTemplate } from '../../../types/characterTemplates';
import List from '../../List/List';
import CategoryCard from '../../Cards/CategoryCard/CategoryCard';
import { categorizeCharacterFields, convertToTemplateCategory } from '../../../utils/characterFields';

interface CharacterCardsViewProps {
  character: Character;
  template: CharacterTemplate | null;
  canEdit: boolean;
  onEditField: (fieldKey: string, field: CharacterField) => void;
  onDeleteField: (fieldKey: string) => void;
  onChangeFieldCategory: (fieldKey: string, newCategory: string) => void;
}

const CharacterCardsView: React.FC<CharacterCardsViewProps> = ({
  character,
  template,
  canEdit,
  onEditField,
  onDeleteField,
  onChangeFieldCategory
}) => {
  const categorizedFields = categorizeCharacterFields(character, template);

  return (
    <List layout='vertical' gap='small'>
      {template && template.schema.categories.map(category => {
        const categoryData = categorizedFields[category.key];
        if (!categoryData) return null;
        
        return (
          <CategoryCard
            key={category.key}
            title={category.name}
            categoryKey={category.key}
            fields={categoryData.fields}
            subcategories={categoryData.subcategories ? 
                categoryData.subcategories.map(convertToTemplateCategory) : undefined}
            allFields={character.fields}
            canEdit={canEdit}
            template={template}
            onEdit={onEditField}
            onDelete={onDeleteField}
            onChangeCategory={onChangeFieldCategory}
          />
        );
      })}
      
      {categorizedFields.other && (
        <CategoryCard
          title="Другое"
          categoryKey="other"
          fields={categorizedFields.other.fields}
          allFields={character.fields}
          canEdit={canEdit}
          template={template}
          onEdit={onEditField}
          onDelete={onDeleteField}
          onChangeCategory={onChangeFieldCategory}
        />
      )}
    </List>
  );
};

export default CharacterCardsView;