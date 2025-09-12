import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CharacterShort } from '../../types/characters';
import { CreateCharacterRequest } from '../../types/characters';
import { CharacterTemplate } from '../../types/characterTemplates';
import { charactersAPI } from '../../services/api';
import { characterTemplatesAPI } from '../../services/api';
import buttonStyles from '../../styles/components/Button.module.css';
import inputStyles from '../../styles/components/Input.module.css';
import styles from './Characters.module.css';

const Characters: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<CharacterShort[]>([]);
  const [templates, setTemplates] = useState<CharacterTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateCharacterRequest>({
    name: '',
    description: '',
    templateId: 0,
  });

  useEffect(() => {
    if (groupId) {
      loadCharacters();
      loadTemplates();
    }
  }, [groupId]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const charactersData = await charactersAPI.getCharacters(parseInt(groupId!));
      setCharacters(charactersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesData = await characterTemplatesAPI.getTemplates(parseInt(groupId!));
      setTemplates(templatesData);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleCreateCharacter = async () => {
    try {
      const newCharacter = await charactersAPI.createCharacter(parseInt(groupId!), formData);
      setShowCreateForm(false);
      setFormData({ name: '', description: '', templateId: 0 });
      // Перенаправляем на страницу созданного персонажа
      navigate(`/group/${groupId}/character/${newCharacter.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
    }
  };

  const handleSelectCharacter = (characterId: number) => {
    navigate(`/group/${groupId}/character/${characterId}`);
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1>Персонажи группы</h1>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button 
          className={buttonStyles.button}
          onClick={() => setShowCreateForm(true)}
        >
          Создать персонажа
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.form}>
          <h2>Создание персонажа</h2>
          
          <div className={styles.formGroup}>
            <label>Название:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputStyles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Описание:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputStyles.input}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Шаблон:</label>
            <select
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: parseInt(e.target.value) })}
              className={inputStyles.input}
            >
              <option value={0}>Выберите шаблон</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formActions}>
            <button 
              onClick={handleCreateCharacter}
              className={buttonStyles.button}
              disabled={!formData.templateId}
            >
              Создать
            </button>
            <button 
              onClick={() => setShowCreateForm(false)}
              className={buttonStyles.button}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className={styles.charactersList}>
        <h2>Список персонажей</h2>
        {characters.length === 0 ? (
          <p>Персонажей пока нет</p>
        ) : (
          characters.map(character => (
            <div key={character.id} className={styles.characterCard}>
              <h3>{character.name}</h3>
              <p>{character.description}</p>
              <button 
                onClick={() => handleSelectCharacter(character.id)}
                className={buttonStyles.button}
              >
                Выбрать
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Characters;