import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Character as CharacterData, UpdateCharacterRequest, CharacterField } from '../../types/characters';
import { charactersAPI } from '../../services/api';
import buttonStyles from '../../styles/components/Button.module.css';
import inputStyles from '../../styles/components/Input.module.css';
import styles from './Character.module.css';

// Функция для генерации ключа на основе названия поля
const generateFieldKey = (fieldName: string): string => {
  if (!fieldName.trim()) return '';
  
  return fieldName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-zа-я0-9_]/g, '');
};

const Character: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateCharacterRequest>({ fields: {} });
  const [fieldKeys, setFieldKeys] = useState<Record<string, string>>({});

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
      
      // Инициализируем форму данными персонажа
      const initialFields: UpdateCharacterRequest['fields'] = {};
      const initialFieldKeys: Record<string, string> = {};
      
      Object.entries(characterData.fields).forEach(([key, field]) => {
        initialFields[key] = { ...field };
        initialFieldKeys[key] = key;
      });
      
      setFormData({ fields: initialFields });
      setFieldKeys(initialFieldKeys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!groupId || !characterId) return;

    try {
      // Преобразуем поля с использованием правильных ключей
      const fieldsWithCorrectKeys: Record<string, Partial<CharacterField> | null> = {};
      
      Object.entries(formData.fields).forEach(([tempKey, field]) => {
        if (field === null) {
          // Удаляем поле
          fieldsWithCorrectKeys[tempKey] = null;
        } else {
          const finalKey = fieldKeys[tempKey] || tempKey;
          fieldsWithCorrectKeys[finalKey] = field;
        }
      });
      
      const requestData = {
        fields: fieldsWithCorrectKeys,
      };
      
      await charactersAPI.updateCharacter(parseInt(groupId!), parseInt(characterId!), requestData);
      setEditing(false);
      loadCharacter(); // Перезагружаем, чтобы получить актуальные данные
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update character');
    }
  };

  const handleDelete = async () => {
    if (!groupId || !characterId) return;

    if (!window.confirm('Вы уверены, что хотите удалить этого персонажа?')) return;

    try {
      await charactersAPI.deleteCharacter(parseInt(groupId!), parseInt(characterId!));
      navigate(`/group/${groupId}/characters`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete character');
    }
  };

  const handleFieldChange = (key: string, field: Partial<CharacterField>) => {
    setFormData(prev => ({
      fields: {
        ...prev.fields,
        [key]: { ...prev.fields[key] as CharacterField, ...field }
      }
    }));
  };

  const handleRemoveField = (key: string) => {
    setFormData(prev => ({
      fields: {
        ...prev.fields,
        [key]: null
      }
    }));
  };

  const handleAddField = () => {
    const newKey = `new_field_${Date.now()}`;
    const fieldName = 'Новое поле';
    const generatedKey = generateFieldKey(fieldName);
    
    setFormData(prev => ({
      fields: {
        ...prev.fields,
        [newKey]: {
          name: fieldName,
          value: 0,
          description: ''
        }
      }
    }));
    
    setFieldKeys(prev => ({
      ...prev,
      [newKey]: generatedKey,
    }));
  };

  const updateFieldName = (tempKey: string, newName: string) => {
    const newFieldKeys = { ...fieldKeys };
    
    // Если ключ еще не задан вручную, генерируем его автоматически
    if (!newFieldKeys[tempKey] || newFieldKeys[tempKey] === generateFieldKey((formData.fields[tempKey] as CharacterField)?.name || '')) {
      newFieldKeys[tempKey] = generateFieldKey(newName);
    }
    
    setFieldKeys(newFieldKeys);
    
    // Обновляем поле в formData
    handleFieldChange(tempKey, {
      ...(formData.fields[tempKey] as CharacterField),
      name: newName,
    });
  };

  const updateFieldKey = (tempKey: string, newKey: string) => {
    setFieldKeys(prev => ({
      ...prev,
      [tempKey]: newKey,
    }));
  };

  const generateKeyFromName = (tempKey: string) => {
    const fieldName = (formData.fields[tempKey] as CharacterField)?.name || '';
    const generatedKey = generateFieldKey(fieldName);
    
    setFieldKeys(prev => ({
      ...prev,
      [tempKey]: generatedKey,
    }));
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;
  if (!character) return <div className={styles.container}>Персонаж не найден</div>;

  return (
    <div className={styles.container}>
      <h1>{character.name}</h1>
      <p>{character.description}</p>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button 
          className={buttonStyles.button}
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Отменить редактирование' : 'Редактировать'}
        </button>
        {editing ? (
          <button 
            className={buttonStyles.button}
            onClick={handleSave}
          >
            Сохранить
          </button>
        ) : (
          <button 
            className={buttonStyles.button}
            onClick={handleDelete}
          >
            Удалить персонажа
          </button>
        )}
      </div>

      <div className={styles.fields}>
        <h2>Поля персонажа</h2>
        {Object.entries(editing ? formData.fields : character.fields).map(([tempKey, field]) => {
          if (field === null) {
            // Поле помечено на удаление, не отображаем
            return null;
          }

          const displayKey = editing ? (fieldKeys[tempKey] || tempKey) : tempKey;

          return (
            <div key={tempKey} className={styles.field}>
              {editing ? (
                <>
                  <div className={styles.formGroup}>
                    <label>Ключ поля:</label>
                    <div className={styles.keyInputGroup}>
                      <input
                        type="text"
                        value={fieldKeys[tempKey] || ''}
                        onChange={(e) => updateFieldKey(tempKey, e.target.value)}
                        className={inputStyles.input}
                        placeholder="Введите ключ поля"
                      />
                      <button 
                        type="button" 
                        onClick={() => generateKeyFromName(tempKey)}
                        className={buttonStyles.button}
                      >
                        Сгенерировать
                      </button>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Название поля:</label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateFieldName(tempKey, e.target.value)}
                      className={inputStyles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Значение:</label>
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => handleFieldChange(tempKey, { value: parseInt(e.target.value) || 0 })}
                      className={inputStyles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Описание поля:</label>
                    <textarea
                      value={field.description}
                      onChange={(e) => handleFieldChange(tempKey, { description: e.target.value })}
                      className={inputStyles.input}
                      rows={2}
                    />
                  </div>

                  <button 
                    onClick={() => handleRemoveField(tempKey)}
                    className={buttonStyles.button}
                  >
                    Удалить поле
                  </button>
                </>
              ) : (
                <>
                  <h3>{field.name} ({displayKey})</h3>
                  <p>{field.description}</p>
                  <div className={styles.fieldValue}>
                    <span>{field.value}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {editing && (
          <button 
            onClick={handleAddField}
            className={buttonStyles.button}
          >
            Добавить поле
          </button>
        )}
      </div>
    </div>
  );
};

export default Character;