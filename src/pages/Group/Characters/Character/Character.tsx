import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Character as CharacterData } from '../../../../types/characters';
import { charactersAPI, characterTemplatesAPI, groupAPI, characterCommandsAPI } from '../../../../services/api';
import commonStyles from '../../../../styles/common.module.css';
import modalStyles from '../../../../styles/modal.module.css';
import uiStyles from './Character.module.css';
import { CharacterTemplate, TemplateField } from '../../../../types/characterTemplates';
import CharacterTableView from '../CharacterTableView/CharacterTableView';
import { TemplateSchema } from '../../../../types/groupSchemas';
import { CategoryData } from '../../../../utils/characterFields';
import { MenuItem } from '../../../../components/commons/DropdownMenu/DropdownMenu';
import { useActionPermissions } from '../../../../hooks/useActionPermissions';
import { TemplateEditContext, TemplateEditContextType } from '../../../../contexts/TemplateEditContext';
import TemplateFieldModal from '../Modals/CharacterFieldModal/TemplateFieldModal';

const Character: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [template, setTemplate] = useState<CharacterTemplate | null>(null);
  const [schema, setSchema] = useState<TemplateSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {canEditCharacterFields} = useActionPermissions();
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<{ field: TemplateField | null; fieldKey: string }>({ field: null, fieldKey: '' });

  useEffect(() => {
    if (groupId && characterId) {
      loadCharacter();
    }
  }, [groupId, characterId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCharacter = async () => {
    try {
      setLoading(true);
      const characterData = await charactersAPI.getCharacter(parseInt(groupId!), parseInt(characterId!));
      setCharacter(characterData);
      
      if (characterData.templateId) {
        try {
          const templateData = await characterTemplatesAPI.getTemplate(
            parseInt(groupId!), 
            characterData.templateId
          );
          setTemplate(templateData);

          const templateSchema = await groupAPI.getTemplateSchema(groupId ? Number(groupId) : 0);
          setSchema(templateSchema);
        } catch (err) {
          console.error('Failed to load template:', err);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFieldValue = async (fieldKey: string, newValue: string) => {
    if (!character) return;

    try {
      if (character.fields[fieldKey]) {
        const result = await characterCommandsAPI.executeCommand(
          Number(groupId),
          Number(characterId),
          {
            type: 'UpdateField',
            payload: { key: fieldKey, field: { ...character.fields[fieldKey], value: Number(newValue) } }
          }
        );
        setCharacter(result);
      } else {
        const result = await characterCommandsAPI.executeCommand(
          Number(groupId),
          Number(characterId),
          {
            type: 'AddField',
            payload: { key: fieldKey, field: { value: Number(newValue) } }
          }
        );
        setCharacter(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update field value');
    }
  };

  const handleDeleteField = async (fieldKey: string) => {
    try {
      const result = await characterCommandsAPI.executeCommand(
        Number(groupId),
        Number(characterId),
        { type: 'DeleteField', payload: { key: fieldKey } }
      );
      setCharacter(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete field');
    }
  }

  const getCategoryMenuItems = (category: CategoryData): MenuItem[] => {
    const items: MenuItem[] = [];
    if (canEditCharacterFields){
      const fields = category.fields.filter(([key, val]) => val.value === 0 && !val.maxValue && template?.fields[key] !== undefined)
      if (fields.length > 0){
        fields.map(([key, value]) => 
          items.push({
            label: `Добавить '${value.name}'`,
            onClick: () => { handleUpdateFieldValue(key, '1') },
          })
        );
      }
    }
    return items;
  };

  const handleSaveField = async (field: TemplateField, fieldKey: string) => {
    if (!character) return;
    try {
      if (character.fields[fieldKey]) {
        const result = await characterCommandsAPI.executeCommand(
          Number(groupId),
          Number(characterId),
          { type: 'UpdateField', payload: { key: fieldKey, field } }
        );
        setCharacter(result);
      } else {
        const result = await characterCommandsAPI.executeCommand(
          Number(groupId),
          Number(characterId),
          { type: 'AddField', payload: { key: fieldKey, field } }
        );
        setCharacter(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save field');
    }
    
    setIsFieldModalOpen(false);
    setEditingField({ field: null, fieldKey: '' });
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;
  if (!character) return <div className={commonStyles.container}>Персонаж не найден</div>;

  const conf: TemplateEditContextType = {
    editMode: canEditCharacterFields,
    onEditField: (key) => { setEditingField({fieldKey: key, field: character.fields[key]}); setIsFieldModalOpen(true) },
    onDeleteField: handleDeleteField
  }

  return (
    <div className={commonStyles.container}>
      {error && <div className={modalStyles.error}>{error}</div>}
      
      <div className={uiStyles.fields} style={{ marginTop: '0px' }}>
        <TemplateEditContext value={conf}>
          <CharacterTableView
            character={character}
            template={template}
            schema={schema}
            canEdit={canEditCharacterFields}
            canEditCategories={false}
            onUpdateFieldValue={handleUpdateFieldValue}
            getCategoryMenuItems={getCategoryMenuItems}
            hideZero={true}
          />
        </TemplateEditContext>
      </div>
      <TemplateFieldModal
        isOpen={isFieldModalOpen && editingField.field !== null}
        onClose={() => {
          setIsFieldModalOpen(false);
          setEditingField({ field: null, fieldKey: '' });
        }}
        onSave={handleSaveField}
        field={editingField.field}
        fieldKey={editingField.fieldKey}
        title={`Редактирование поля ${editingField.field?.name}`}
        fullEditMode={false}
      />
    </div>


  );
};

export default Character;