import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setCharacter: (c: Character | null) => void;
  setTemplate: (t: CharacterTemplate | null) => void;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    let cancelled = false;

    const setLoading_local = (v: boolean) => {
      if (!cancelled) setLoading(v);
    };
    const setError_local = (v: string | null) => {
      if (!cancelled) setError(v);
    };

    setLoading_local(true);
    setError_local(null);

    try {
      const charData = await charactersAPI.getCharacter(groupId, characterId);
      if (cancelled) return;

      setCharacter(charData);

      if (charData.templateId) {
        const [template, templateSchema] = await Promise.all([
          characterTemplatesAPI.getTemplate(groupId, charData.templateId),
          groupAPI.getTemplateSchema(groupId),
        ]);
        if (cancelled) return;
        setTemplate(template);
        setTemplateSchema(templateSchema);
      } else {
        setTemplate(null);
        setTemplateSchema(null);
      }

      const [items, skills, quests] = await Promise.all([
        characterItemsAPI.getCharacterItems(groupId, characterId),
        characterSkillsAPI.getCharacterSkills(groupId, characterId),
        characterQuestsAPI.getCharacterQuests(groupId, characterId),
      ]);
      if (cancelled) return;

      setItems(items);
      setSkills(skills);
      setQuests(quests);
    } catch (err: unknown) {
      if (cancelled) return;
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError_local(message);
    } finally {
      if (cancelled) return;
      setLoading_local(false);
    }
  }, [groupId, characterId]);

  useEffect(() => {
    refetch();
    return () => {};
  }, [refetch]);

  const value = useMemo(
    () => ({
      character,
      template,
      templateSchema,
      items,
      skills,
      quests,
      loading,
      error,
      refetch,
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
      loading,
      error,
      refetch,
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
