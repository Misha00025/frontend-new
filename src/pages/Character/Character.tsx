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
    template.schema.categories.forEach(category => {
      categorizedFields[category.key] = [];
    });
    categorizedFields.other = [];
    Object.entries(character.fields).forEach(([key, field]) => {
      let foundCategory = false;
      for (const category of template.schema.categories) {
        if (category.fields.includes(key)) {
          categorizedFields[category.key].push([key, field]);
          foundCategory = true;
          break;
        }
      }
      if (!foundCategory && field.category) {
        for (const category of template.schema.categories) {
          if (category.key === field.category) {
            categorizedFields[category.key].push([key, field]);
            foundCategory = true;
            break;
          }
        }
      }
      if (!foundCategory) {
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
          <IconButton
            icon='edit'
            title='Редактировать'
            onClick={handleAddField}
          />
          { canDeleteThisCharacter && (
            <IconButton 
              icon='delete'
              title='Удалить'
              onClick={handleDeleteCharacter}
            />
          )}
        </div>
      )}
      
      <div className={uiStyles.fields}>
        <h2>Поля персонажа</h2>
        
        {/* Отображаем поля по категориям из шаблона */}
        {template && template.schema.categories.map(category => (
          <div key={category.key} className={uiStyles.categorySection}>
            <h3>{category.name}</h3>
            <List layout="grid" gap="medium">
              {categorizedFields[category.key]?.map(([key, field]) => (
                <div key={key} className={uiStyles.fieldCard}>
                  <div className={uiStyles.fieldHeader}>
                    <h4>{field.name}</h4>
                    <span className={uiStyles.fieldKey}>({key})</span>
                  </div>
                  {field.description && <p className={uiStyles.fieldDescription}>{field.description}</p>}
                  <div className={uiStyles.fieldValue}>
                    <strong>Значение:</strong> {field.value}
                  </div>
                  {canEditThisCharacter && (
                    <div>
                      <select
                        value={field.category || 'other'}
                        onChange={(e) => handleChangeFieldCategory(key, e.target.value)}
                        className={buttonStyles.button}
                      >
                        <option value="other">Другое</option>
                        {template.schema.categories.map(cat => (
                          <option key={cat.key} value={cat.key}>{cat.name}</option>
                        ))}
                      </select>
                      <div className={uiStyles.fieldActions}>
                        <IconButton
                          title='Редактировать'
                          icon='edit' 
                          onClick={() => handleEditField(key, field)}
                        />
                        <IconButton
                          title='Удалить'
                          icon='delete'
                          onClick={() => handleDeleteField(key)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </List>
          </div>
        ))}
        
        <div className={uiStyles.categorySection}>
          <h3>Другое</h3>
          <List layout="grid" gap="small">
            {categorizedFields.other?.map(([key, field]) => (
              <div key={key} className={uiStyles.fieldCard}>
                <div className={uiStyles.fieldHeader}>
                  <h4>{field.name}</h4>
                  <span className={uiStyles.fieldKey}>({key})</span>
                </div>
                {field.description && <p className={uiStyles.fieldDescription}>{field.description}</p>}
                <div className={uiStyles.fieldValue}>
                  <strong>Значение:</strong> {field.value}
                </div>
                {canEditThisCharacter && (
                  <div>
                    {template && (
                      <select
                        value={field.category || 'other'}
                        onChange={(e) => handleChangeFieldCategory(key, e.target.value)}
                        className={buttonStyles.button}
                      >
                        <option value="other">Другое</option>
                        {template.schema.categories.map(category => (
                          <option key={category.key} value={category.key}>{category.name}</option>
                        ))}
                      </select>
                    )}
                    <div className={uiStyles.fieldActions}>
                      <IconButton
                        title='Редактировать'
                        icon='edit' 
                        onClick={() => handleEditField(key, field)}
                      />
                      <IconButton
                        title='Удалить'
                        icon='delete'
                        onClick={() => handleDeleteField(key)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </List>
        </div>
      </div>

      <CharacterFieldModal 
        isOpen={isFieldModalOpen}
        onClose={handleCloseFieldModal}
        onSave={handleSaveField}
        field={editingField?.field || null}
        fieldKey={editingField?.key || ''}
        title={editingField ? 'Редактирование поля' : 'Добавление поля'}
        isKeyEditable={!editingField}
        categories={template?.schema.categories || []} // Передаем категории в модальное окно
      />
    </div>
  );
};

export default Character;