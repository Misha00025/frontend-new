import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Character as CharacterData, UpdateCharacterRequest, CharacterField } from '../../types/characters';
import { charactersAPI, characterTemplatesAPI } from '../../services/api';
import CharacterFieldModal from '../../components/Modals/CharacterFieldModal/CharacterFieldModal';
import commonStyles from '../../styles/common.module.css';
import uiStyles from './Character.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import { CharacterTemplate, TemplateCategory } from '../../types/characterTemplates';
import List from '../../components/List/List';
import CharacterTableView from '../../components/Views/CharacterTableView/CharacterTableView';
import CharacterCardsView from '../../components/Views/CharacterCardsView/CharacterCardsView';
import IconButton from '../../components/Buttons/IconButton';

const Character: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [template, setTemplate] = useState<CharacterTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<{ key: string; field: CharacterField } | null>(null);
  const [isAddingField, setIsAddingField] = useState(false);
  const { canDeleteThisCharacter, canEditThisCharacter } = useActionPermissions();
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  useEffect(() => {
    if (groupId && characterId) {
      loadCharacter();
    }
  }, [groupId, characterId]);

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

  const handleSaveField = async (field: CharacterField, fieldKey: string) => {
    if (!character) return;

    try {
      const updateData: UpdateCharacterRequest = {
        fields: {}
      };

      if (editingField) {
        if (fieldKey !== editingField.key) {
          updateData.fields[editingField.key] = null; 
          updateData.fields[fieldKey] = field; 
        } else {
          updateData.fields[fieldKey] = field;
        }
      } else if (isAddingField) {
        updateData.fields[fieldKey] = field;
      }

      const updatedCharacter = await charactersAPI.updateCharacter(
        parseInt(groupId!), 
        parseInt(characterId!), 
        updateData
      );
      
      setCharacter(updatedCharacter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update field');
      throw err;
    }
  };

  const handleDeleteField = async (fieldKey: string) => {
    if (!character) return;

    if (!window.confirm('Вы уверены, что хотите удалить это поле?')) return;

    try {
      const updateData: UpdateCharacterRequest = {
        fields: {
          [fieldKey]: null
        }
      };

      const updatedCharacter = await charactersAPI.updateCharacter(
        parseInt(groupId!), 
        parseInt(characterId!), 
        updateData
      );
      
      setCharacter(updatedCharacter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete field');
    }
  };

  const handleChangeFieldCategory = async (fieldKey: string, newCategory: string) => {
    if (!character) return;

    try {
      const field = character.fields[fieldKey];
      const updatedField = {
        ...field,
        category: newCategory === 'other' ? undefined : newCategory
      };

      const updateData: UpdateCharacterRequest = {
        fields: {
          [fieldKey]: updatedField
        }
      };

      const updatedCharacter = await charactersAPI.updateCharacter(
        parseInt(groupId!), 
        parseInt(characterId!), 
        updateData
      );
      
      setCharacter(updatedCharacter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update field category');
    }
  };

  const handleEditField = (fieldKey: string, field: CharacterField) => {
    setEditingField({ key: fieldKey, field });
    setIsAddingField(false);
    setIsFieldModalOpen(true);
  };

  const handleAddField = (category?: string) => {
    console.log(`add field to category: ${category}`)
    setEditingField(category ? {key: '', field: {name:'', description:'', value:0, category:category}} : null);
    setIsAddingField(true);
    setIsFieldModalOpen(true);
  };

  const handleCloseFieldModal = () => {
    setIsFieldModalOpen(false);
    setEditingField(null);
    setIsAddingField(false);
  };

  const handleUpdateFieldValue = async (fieldKey: string, newValue: string) => {
    if (!character) return;
  
    try {
      const field = character.fields[fieldKey];
      const updatedField = {
        ...field,
        value: Number(newValue)
      };
  
      const updateData: UpdateCharacterRequest = {
        fields: {
          [fieldKey]: updatedField
        }
      };
  
      const updatedCharacter = await charactersAPI.updateCharacter(
        parseInt(groupId!), 
        parseInt(characterId!), 
        updateData
      );
      console.log(updatedCharacter)
      setCharacter(updatedCharacter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update field value');
    }
  };

  const handleDeleteCharacter = async () => {
    if (!groupId || !characterId) return;

    if (!window.confirm('Вы уверены, что хотите удалить этого персонажа?')) return;

    try {
      await charactersAPI.deleteCharacter(parseInt(groupId!), parseInt(characterId!));
      navigate(`/group/${groupId}/characters`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete character');
    }
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;
  if (!character) return <div className={commonStyles.container}>Персонаж не найден</div>;

  const categoryNames: Record<string, string> = {};
  if (template) {
    template.schema.categories.forEach(category => {
      categoryNames[category.key] = category.name;
    });
  }
  categoryNames.other = "Другое";

  const getAllCategories = (categories: TemplateCategory[]): TemplateCategory[] => {
    let allCategories: TemplateCategory[] = [];
    
    categories.forEach(category => {
      allCategories.push(category);
      if (category.categories && category.categories.length > 0) {
        allCategories = allCategories.concat(getAllCategories(category.categories));
      }
    });
    
    return allCategories;
  };

  const allCategories = template ? getAllCategories(template.schema.categories) : [];

  return (
    <div className={commonStyles.container}>
      <List layout='horizontal'>
        {canDeleteThisCharacter && (<IconButton 
          title='Удалить персонажа'
          icon='delete'
          onClick={handleDeleteCharacter}
          variant='danger'
        />)}
        <h1 style={{marginBottom: '2px'}}>{character.name}</h1> 
      </List>
      
      <p>{character.description}</p>

      {error && <div className={commonStyles.error}>{error}</div>}
      
      <div className={uiStyles.fields} style={{marginTop: '0px'}}>
        <List layout='horizontal'>
          <h2>Поля персонажа</h2>
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
        {canEditThisCharacter && (<List layout='horizontal'>
          <IconButton 
            title='Добавить поле'
            icon='add'
            onClick={handleAddField}
          />
        </List>)}
        {viewMode === 'card' ? (
          <CharacterCardsView
            character={character}
            template={template}
            canEdit={canEditThisCharacter}
            onEditField={handleEditField}
            onDeleteField={handleDeleteField}
            onChangeFieldCategory={handleChangeFieldCategory}
          />
        ) : (
          <CharacterTableView
            character={character}
            template={template}
            canEdit={canEditThisCharacter}
            onUpdateFieldValue={handleUpdateFieldValue}
            onAddField={canEditThisCharacter ? handleAddField : undefined}
          />
        )}
      </div>

      <CharacterFieldModal 
        isOpen={isFieldModalOpen}
        onClose={handleCloseFieldModal}
        onSave={handleSaveField}
        field={editingField?.field || null}
        fieldKey={editingField?.key || ''}
        title={isAddingField ? 'Редактирование поля' : 'Добавление поля'}
        isKeyEditable={!editingField}
        categories={allCategories}
      />
    </div>
  );
};

export default Character;