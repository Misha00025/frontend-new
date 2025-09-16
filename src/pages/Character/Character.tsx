import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Character as CharacterData, UpdateCharacterRequest, CharacterField } from '../../types/characters';
import { charactersAPI, characterTemplatesAPI } from '../../services/api';
import CharacterFieldModal from '../../components/Modals/CharacterFieldModal/CharacterFieldModal';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import uiStyles from './Character.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import { CharacterTemplate, TemplateCategory } from '../../types/characterTemplates';
import IconButton from '../../components/Buttons/IconButton';
import List from '../../components/List/List';
import CategoryCard from '../../components/Cards/CategoryCard/CategoryCard';

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

  const getFieldsByCategory = () => {
    if (!template && character) return { uncategorized: Object.entries(character.fields) };
    if (!template || !character) return {};
    
    const categorizedFields: Record<string, [string, CharacterField][]> = {};
    
    // Инициализируем категории из шаблона
    template.schema.categories.forEach(category => {
      categorizedFields[category.key] = [];
    });
    
    // Добавляем категорию для полей без категории
    categorizedFields.other = [];
    
    // Сначала добавляем поля, которые явно указаны в шаблоне
    template.schema.categories.forEach(category => {
      category.fields.forEach(fieldKey => {
        if (character.fields[fieldKey]) {
          categorizedFields[category.key].push([fieldKey, character.fields[fieldKey]]);
        }
      });
    });
    
    Object.entries(character.fields).forEach(([key, field]) => {
      let alreadyAdded = false;
      for (const category of template.schema.categories) {
        if (category.fields.includes(key)) {
          alreadyAdded = true;
          break;
        }
      }
      
      if (alreadyAdded) return;
      if (field.category && categorizedFields[field.category]) {
        categorizedFields[field.category].push([key, field]);
      } else {
        categorizedFields.other.push([key, field]);
      }
    });
    
    return categorizedFields;
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

  const handleAddField = () => {
    setEditingField(null);
    setIsAddingField(true);
    setIsFieldModalOpen(true);
  };

  const handleCloseFieldModal = () => {
    setIsFieldModalOpen(false);
    setEditingField(null);
    setIsAddingField(false);
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

  const categorizedFields = getFieldsByCategory();

  return (
    <div className={commonStyles.container}>
      <h1>{character.name}</h1>
      <p>{character.description}</p>

      {error && <div className={commonStyles.error}>{error}</div>}
      {canEditThisCharacter && (
        <div className={commonStyles.actions}>
          <button 
            className={buttonStyles.button}
            onClick={handleAddField}
          >
            Добавить поле
          </button>
          { canDeleteThisCharacter && (
            <button 
              className={buttonStyles.button}
              onClick={handleDeleteCharacter}
            >
              Удалить персонажа
            </button>
          )}
        </div>
      )}
      
      <div className={uiStyles.fields}>
        <h2>Поля персонажа</h2>
        <List layout='vertical' gap='small'>
          {/* Отображаем поля по категориям из шаблона */}
          {template && template.schema.categories.map(category => (
            <CategoryCard
              key={category.key}
              title={category.name}
              fields={categorizedFields[category.key] || []}
              canEdit={canEditThisCharacter}
              template={template}
              onEdit={handleEditField}
              onDelete={handleDeleteField}
              onChangeCategory={handleChangeFieldCategory}
            />
          ))}
          
          <CategoryCard
            title="Другое"
            fields={categorizedFields.other || []}
            canEdit={canEditThisCharacter}
            template={template}
            onEdit={handleEditField}
            onDelete={handleDeleteField}
            onChangeCategory={handleChangeFieldCategory}
          />
        </List>
      </div>

      <CharacterFieldModal 
        isOpen={isFieldModalOpen}
        onClose={handleCloseFieldModal}
        onSave={handleSaveField}
        field={editingField?.field || null}
        fieldKey={editingField?.key || ''}
        title={editingField ? 'Редактирование поля' : 'Добавление поля'}
        isKeyEditable={!editingField}
        categories={template?.schema.categories || []}
      />
    </div>
  );
};

export default Character;