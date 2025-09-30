// components/Preview/TemplatePreview.tsx
import React, { useState } from 'react';
import { CharacterTemplate } from '../../../types/characterTemplates';
import commonStyles from '../../../styles/common.module.css';
import uiStyles from '../../../styles/ui.module.css';
import { templateToCharacter } from '../../../utils/templateUtils';
import CharacterCardsView from '../CharacterCardsView/CharacterCardsView';
import CharacterTableView from '../CharacterTableView/CharacterTableView';
import styles from './TemplatePreview.module.css';
import List from '../../List/List';

interface TemplatePreviewProps {
  template: CharacterTemplate;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template }) => {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const character = templateToCharacter(template);

  return (
    <div className={''}>
      <h2>{template.name}</h2>
      <p>{template.description}</p>

      <div className={uiStyles.fields} style={{ marginTop: '0px' }}>
        <List layout='horizontal'>
          <h3>Поля шаблона</h3>
          <div className={uiStyles.viewSwitcher}>
            <button 
              className={`${uiStyles.viewButton} ${viewMode === 'table' ? uiStyles.active : ''}`}
              onClick={() => setViewMode('table')}
              title="Табличный вид"
            >
              📊
            </button>
            <button 
              className={`${uiStyles.viewButton} ${viewMode === 'card' ? uiStyles.active : ''}`}
              onClick={() => setViewMode('card')}
              title="Карточный вид"
            >
              📋
            </button>
          </div>
        </List>

        {viewMode === 'card' ? (
          <CharacterCardsView
            character={character}
            template={template}
            canEdit={false}
            onEditField={() => {}}
            onDeleteField={() => {}}
            onChangeFieldCategory={() => {}}
          />
        ) : (
          <CharacterTableView
            character={character}
            template={template}
            canEdit={false}
            onUpdateFieldValue={() => {}}
          />
        )}
        <div className={styles.fieldsSection}>
            <h3>Поля шаблона</h3>
            <div className={styles.fieldsGrid}>
            {Object.entries(template.fields).map(([key, field]) => (
                <div key={key} className={styles.fieldCard}>
                    <div className={styles.fieldHeader}>
                        <h4>{field.name}</h4>
                        <span className={styles.fieldKey}>({key})</span>
                    </div>
                    
                    {field.description && (
                        <p className={styles.fieldDescription}>{field.description}</p>
                    )}
                    
                    <div className={styles.fieldDetails}>
                        {field.formula && (
                        <div className={styles.fieldFormula}>
                            <strong>Формула:</strong> {field.formula}
                        </div>
                        )}
                        <div className={styles.fieldType}>
                            <strong>Тип:</strong> {field.maxValue !== undefined ? 'параметр' : 'простое'}
                        </div>
                    </div>
                </div>
            ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default TemplatePreview;