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
import List from '../../components/List/List';
import CategoryCard from '../../components/Cards/CategoryCard/CategoryCard';
import CharacterTableView from '../../components/Views/CharacterTableView/CharacterTableView';

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

  const getFieldsByCategory = () => {
    if (!template || !character || !character.fields) return {};
    
    const categorizedFields: Record<string, {
      key: string;
      name: string;
      fields: [string, CharacterField, boolean][];
      subcategories?: any[];
    }> = {};
    
    // Функция для рекурсивной обработки категорий
    const processCategory = (category: TemplateCategory, parentKey?: string): any => {
      const categoryKey = parentKey ? `${parentKey}.${category.key}` : category.key;
      const fieldsInCategory: [string, CharacterField, boolean][] = [];
      
      // Добавляем поля категории
      category.fields.forEach(fieldKey => {
        if (character.fields[fieldKey]) {
          fieldsInCategory.push([fieldKey, character.fields[fieldKey], true]);
        }
      });
      
      // Обрабатываем вложенные категории
      let subcategories: any[] = [];
      if (category.categories) {
        subcategories = category.categories.map(subCategory => 
          processCategory(subCategory, categoryKey)
        );
      }
      
      return {
        key: categoryKey,
        name: category.name,
        fields: fieldsInCategory,
        subcategories: subcategories.length > 0 ? subcategories : undefined
      };
    };
    
    // Обрабатываем все категории шаблона
    template.schema.categories.forEach(category => {
      const categoryData = processCategory(category);
      categorizedFields[category.key] = categoryData;
    });
    
    // Добавляем поле "Другое"
    categorizedFields.other = {
      key: 'other',
      name: 'Другое',
      fields: []
    };
    
    // Добавляем поля, не входящие в категории шаблона
    Object.entries(character.fields).forEach(([key, field]) => {
      let alreadyAdded = false;
      
      // Проверяем, добавлено ли поле в какую-либо категорию
      const checkInCategory = (category: any): boolean => {
        if (category.fields.some(([fieldKey]: [string, any]) => fieldKey === key)) {
          return true;
        }
        
        if (category.subcategories) {
          for (const subcategory of category.subcategories) {
            if (checkInCategory(subcategory)) return true;
          }
        }
        
        return false;
      };
      
      for (const category of Object.values(categorizedFields)) {
        if (checkInCategory(category)) {
          alreadyAdded = true;
          break;
        }
      }
      
      if (!alreadyAdded) {
        if (field.category && categorizedFields[field.category]) {
          // Находим категорию и добавляем поле
          const findAndAddToCategory = (category: any, targetKey: string): boolean => {
            if (category.key === targetKey) {
              category.fields.push([key, field, false]);
              return true;
            }
            
            if (category.subcategories) {
              for (const subcategory of category.subcategories) {
                if (findAndAddToCategory(subcategory, targetKey)) return true;
              }
            }
            
            return false;
          };
          
          for (const category of Object.values(categorizedFields)) {
            if (findAndAddToCategory(category, field.category)) break;
          }
        } else {
          categorizedFields.other.fields.push([key, field, false]);
        }
      }
    });
    
    // Удаляем пустую категорию "Другое"
    if (categorizedFields.other.fields.length === 0) {
      delete categorizedFields.other;
    }
    
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

  const categorizedFields = getFieldsByCategory();

  const categoryNames: Record<string, string> = {};
  if (template) {
    template.schema.categories.forEach(category => {
      categoryNames[category.key] = category.name;
    });
  }
  categoryNames.other = "Другое";

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
        <List layout='horizontal'>
          <h2>Поля персонажа</h2>
          <div className={uiStyles.viewSwitcher}>
            <button 
              className={`${uiStyles.viewButton} ${viewMode === 'card' ? uiStyles.active : ''}`}
              onClick={() => setViewMode('card')}
              title="Карточный вид"
            >
              📋
            </button>
            <button 
              className={`${uiStyles.viewButton} ${viewMode === 'table' ? uiStyles.active : ''}`}
              onClick={() => setViewMode('table')}
              title="Табличный вид"
            >
              📊
            </button>
          </div>
        </List>
        {viewMode === 'card' ? (
          <List layout='vertical' gap='small'>
            {/* Отображаем поля по категориям из шаблона */}
            {template && template.schema.categories.map(category => {
              const categoryData = categorizedFields[category.key];
              if (!categoryData) return null;
              
              return (
                <CategoryCard
                  key={category.key}
                  title={category.name}
                  categoryKey={category.key}
                  fields={categoryData.fields}
                  subcategories={categoryData.subcategories}
                  allFields={character.fields}
                  canEdit={canEditThisCharacter}
                  template={template}
                  onEdit={handleEditField}
                  onDelete={handleDeleteField}
                  onChangeCategory={handleChangeFieldCategory}
                />
              );
            })}
            
            {categorizedFields.other && (
              <CategoryCard
                title="Другое"
                categoryKey="other"
                fields={categorizedFields.other.fields}
                allFields={character.fields}
                canEdit={canEditThisCharacter}
                template={template}
                onEdit={handleEditField}
                onDelete={handleDeleteField}
                onChangeCategory={handleChangeFieldCategory}
              />
            )}
          </List>
        ) : (
          <CharacterTableView
            categorizedFields={categorizedFields}
            canEdit={canEditThisCharacter}
            onUpdateFieldValue={handleUpdateFieldValue}
          />
        )}
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