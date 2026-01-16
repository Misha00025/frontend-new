// components/Preview/TemplatePreview.tsx
import React from 'react';
import { CharacterTemplate } from '../../../types/characterTemplates';
import { templateToCharacter } from '../../../utils/templateUtils';
import CharacterTableView from '../CharacterTableView/CharacterTableView';
import { TemplateSchema } from '../../../types/groupSchemas';

interface TemplatePreviewProps {
  template: CharacterTemplate;
  schema: TemplateSchema;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, schema }) => {
  const character = templateToCharacter(template);

  return (
    <div>
      <CharacterTableView
        character={character}
        template={template}
        schema={schema}
        canEdit={false}
        onUpdateFieldValue={() => {}}
      />
    </div>
  );
};

export default TemplatePreview;