import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CharacterShort } from '../../types/characters';
import { CreateCharacterRequest } from '../../types/characters';
import { CharacterTemplate } from '../../types/characterTemplates';
import { charactersAPI } from '../../services/api';
import { characterTemplatesAPI } from '../../services/api';
import CharacterModal from '../../components/Modals/CharacterModal/CharacterModal';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import uiStyles from '../../styles/ui.module.css';

const Characters: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<CharacterShort[]>([]);
  const [templates, setTemplates] = useState<CharacterTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCreateCharacter = async (characterData: CreateCharacterRequest) => {
    try {
      const newCharacter = await charactersAPI.createCharacter(parseInt(groupId!), characterData);
      // Перенаправляем на страницу созданного персонажа
      navigate(`/group/${groupId}/character/${newCharacter.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
      throw err; // Пробрасываем ошибку для обработки в модальном окне
    }
  };

  const handleSelectCharacter = (characterId: number) => {
    navigate(`/group/${groupId}/character/${characterId}`);
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <h1>Персонажи группы</h1>

      {error && <div className={commonStyles.error}>{error}</div>}

      <div className={commonStyles.actions}>
        <button 
          className={buttonStyles.button}
          onClick={() => setIsModalOpen(true)}
          disabled={templates.length === 0}
        >
          Создать персонажа
        </button>
        {templates.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Для создания персонажа сначала создайте хотя бы один шаблон
          </p>
        )}
      </div>

      <div className={commonStyles.list}>
        <h2>Список персонажей</h2>
        {characters.length === 0 ? (
          <p>Персонажей пока нет</p>
        ) : (
          characters.map(character => (
            <div key={character.id} className={uiStyles.card}>
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

      <CharacterModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateCharacter}
        templates={templates}
        title="Создание персонажа"
      />
    </div>
  );
};

export default Characters;