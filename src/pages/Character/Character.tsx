import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Character as CharacterData, UpdateCharacterRequest, CharacterField } from '../../types/characters';
import { charactersAPI } from '../../services/api';
import CharacterFieldModal from '../../components/CharacterFieldModal/CharacterFieldModal';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import uiStyles from '../../styles/ui.module.css';

const Character: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<{ key: string; field: CharacterField } | null>(null);
  const [isAddingField, setIsAddingField] = useState(false);

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

      // Если это редактирование существующего поля
      if (editingField) {
        // Если ключ изменился, удаляем старое поле и добавляем новое
        if (fieldKey !== editingField.key) {
          updateData.fields[editingField.key] = null; // Удаляем старое поле
          updateData.fields[fieldKey] = field; // Добавляем новое поле
        } else {
          // Если ключ не изменился, просто обновляем поле
          updateData.fields[fieldKey] = field;
        }
      } else if (isAddingField) {
        // Если это добавление нового поля
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

  return (
    <div className={commonStyles.container}>
      <h1>{character.name}</h1>
      <p>{character.description}</p>

      {error && <div className={commonStyles.error}>{error}</div>}

      <div className={commonStyles.actions}>
        <button 
          className={buttonStyles.button}
          onClick={handleAddField}
        >
          Добавить поле
        </button>
        <button 
          className={buttonStyles.button}
          onClick={handleDeleteCharacter}
        >
          Удалить персонажа
        </button>
      </div>

      <div className={uiStyles.fields}>
        <h2>Поля персонажа</h2>
        {Object.entries(character.fields).map(([key, field]) => (
          <div key={key} className={uiStyles.fieldCard}>
            <div className={uiStyles.fieldHeader}>
              <h3>{field.name}</h3>
              <span className={uiStyles.fieldKey}>({key})</span>
            </div>
            {field.description && <p className={uiStyles.fieldDescription}>{field.description}</p>}
            <div className={uiStyles.fieldValue}>
              <strong>Значение:</strong> {field.value}
            </div>
            
            <div className={uiStyles.fieldActions}>
              <button 
                onClick={() => handleEditField(key, field)}
                className={buttonStyles.button}
              >
                Редактировать
              </button>
              <button 
                onClick={() => handleDeleteField(key)}
                className={buttonStyles.button}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      <CharacterFieldModal 
        isOpen={isFieldModalOpen}
        onClose={handleCloseFieldModal}
        onSave={handleSaveField}
        field={editingField?.field || null}
        fieldKey={editingField?.key || ''}
        title={editingField ? 'Редактирование поля' : 'Добавление поля'}
        isKeyEditable={!editingField} // Разрешаем редактирование ключа только при создании нового поля
      />
    </div>
  );
};

export default Character;