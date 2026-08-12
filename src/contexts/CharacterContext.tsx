import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Character } from '../types/characters';
import { CharacterTemplate } from '../types/characterTemplates';
import { TemplateSchema } from '../types/groupSchemas';
import { CharacterItem } from '../types/characterItems';
import { GroupSkill } from '../types/groupSkills';
import { GroupQuest } from '../types/groupQuests';
import {
  charactersAPI,
  characterTemplatesAPI,
  groupAPI,
  characterItemsAPI,
  characterSkillsAPI,
  characterQuestsAPI,
} from '../services/api';

export interface CharacterContextType {
  character: Character | null;
  template: CharacterTemplate | null;
  templateSchema: TemplateSchema | null;
  items: CharacterItem[];
  skills: GroupSkill[];
  quests: GroupQuest[];
  characterLoading: boolean;
  templateLoading: boolean;
  itemsLoading: boolean;
  skillsLoading: boolean;
  questsLoading: boolean;
  error: string | null;
  refreshCharacter: () => Promise<void>;
  refreshTemplate: () => Promise<void>;
  refreshItems: () => Promise<void>;
  refreshSkills: () => Promise<void>;
  refreshQuests: () => Promise<void>;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  setTemplate: React.Dispatch<React.SetStateAction<CharacterTemplate | null>>;
  setItems: React.Dispatch<React.SetStateAction<CharacterItem[]>>;
  setSkills: React.Dispatch<React.SetStateAction<GroupSkill[]>>;
  setQuests: React.Dispatch<React.SetStateAction<GroupQuest[]>>;
}

interface CharacterProviderProps {
  groupId: number;
  characterId: number;
  children: React.ReactNode;
}

const CharacterContext = createContext<CharacterContextType | null>(null);

const CharacterProvider: React.FC<CharacterProviderProps> = ({
  groupId,
  characterId,
  children,
}) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [template, setTemplate] = useState<CharacterTemplate | null>(null);
  const [templateSchema, setTemplateSchema] = useState<TemplateSchema | null>(
    null,
  );
  const [items, setItems] = useState<CharacterItem[]>([]);
  const [skills, setSkills] = useState<GroupSkill[]>([]);
  const [quests, setQuests] = useState<GroupQuest[]>([]);
  const [characterLoading, setCharacterLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [questsLoading, setQuestsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCharacter = useCallback(async () => {
    setCharacterLoading(true);
    try {
      const charData = await charactersAPI.getCharacter(groupId, characterId);
      setCharacter(charData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setCharacterLoading(false);
    }
  }, [groupId, characterId]);

  const refreshTemplate = useCallback(async () => {
    setTemplateLoading(true);
    try {
      const [templateData, schemaData] = await Promise.all([
        characterTemplatesAPI.getTemplate(
          groupId,
          character?.templateId ?? 0,
        ),
        groupAPI.getTemplateSchema(groupId),
      ]);
      setTemplate(templateData);
      setTemplateSchema(schemaData);
    } catch (err) {
      console.error('Failed to load template:', err);
    } finally {
      setTemplateLoading(false);
    }
  }, [groupId, character?.templateId]);

  const refreshItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const data = await characterItemsAPI.getCharacterItems(groupId, characterId);
      setItems(data);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setItemsLoading(false);
    }
  }, [groupId, characterId]);

  const refreshSkills = useCallback(async () => {
    setSkillsLoading(true);
    try {
      const data = await characterSkillsAPI.getCharacterSkills(groupId, characterId);
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setSkillsLoading(false);
    }
  }, [groupId, characterId]);

  const refreshQuests = useCallback(async () => {
    setQuestsLoading(true);
    try {
      const data = await characterQuestsAPI.getCharacterQuests(groupId, characterId);
      setQuests(data);
    } catch (err) {
      console.error('Failed to load quests:', err);
    } finally {
      setQuestsLoading(false);
    }
  }, [groupId, characterId]);

  const value = useMemo(
    () => ({
      character,
      template,
      templateSchema,
      items,
      skills,
      quests,
      characterLoading,
      templateLoading,
      itemsLoading,
      skillsLoading,
      questsLoading,
      error,
      refreshCharacter,
      refreshTemplate,
      refreshItems,
      refreshSkills,
      refreshQuests,
      setCharacter,
      setTemplate,
      setItems,
      setSkills,
      setQuests,
    }),
    [
      character,
      template,
      templateSchema,
      items,
      skills,
      quests,
      characterLoading,
      templateLoading,
      itemsLoading,
      skillsLoading,
      questsLoading,
      error,
      refreshCharacter,
      refreshTemplate,
      refreshItems,
      refreshSkills,
      refreshQuests,
      setCharacter,
      setTemplate,
      setItems,
      setSkills,
      setQuests,
    ],
  );

  return (
    <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>
  );
};

const useCharacter = (): CharacterContextType => {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return ctx;
};

export { useCharacter };
export { CharacterProvider };
