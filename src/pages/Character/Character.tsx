import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Character as CharacterData } from '../../types/characters';
import { charactersAPI, characterTemplatesAPI, groupAPI } from '../../services/api';
import commonStyles from '../../styles/common.module.css';
import uiStyles from './Character.module.css';
import { CharacterTemplate } from '../../types/characterTemplates';
import CharacterTableView from '../../components/Views/CharacterTableView/CharacterTableView';
import { TemplateSchema } from '../../types/groupSchemas';

const Character: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [template, setTemplate] = useState<CharacterTemplate | null>(null);
  const [schema, setSchema] = useState<TemplateSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;
  if (!character) return <div className={commonStyles.container}>Персонаж не найден</div>;

  return (
    <div className={commonStyles.container}>
      <h1 style={{ marginBottom: '2px' }}>{character.name}</h1> 
      <p>{character.description}</p>

      {error && <div className={commonStyles.error}>{error}</div>}
      
      <div className={uiStyles.fields} style={{ marginTop: '0px' }}>
        <h2>Поля персонажа</h2>
        <CharacterTableView
          character={character}
          template={template}
          schema={schema}
          canEdit={false}
          onUpdateFieldValue={() => {}}
        />
      </div>
    </div>
  );
};

export default Character;