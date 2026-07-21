import { useState, useEffect, useCallback } from 'react';
import { DashboardSettings } from '../types/dashboardSettings';

const STORAGE_KEY = (gid: number, cid: number) => `character_dashboard_${gid}_${cid}`;

const defaultSettings: DashboardSettings = {
  fields: [],
  items: [],
  equipped: [],
  pinnedSkills: [],
};

export function useDashboardSettings(groupId: number, characterId: number) {
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY(groupId, characterId));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({
          fields: parsed.fields || [],
          items: parsed.items || [],
          equipped: parsed.equipped || [],
          pinnedSkills: parsed.pinnedSkills || [],
        });
      } catch {
        setSettings(defaultSettings);
      }
    } else {
      setSettings(defaultSettings);
    }
  }, [groupId, characterId]);

  const saveSettings = useCallback((newSettings: DashboardSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY(groupId, characterId), JSON.stringify(newSettings));
  }, [groupId, characterId]);

  const toggleField = useCallback((fieldKey: string) => {
    setSettings(prev => {
      const fields = prev.fields.includes(fieldKey)
        ? prev.fields.filter(k => k !== fieldKey)
        : [...prev.fields, fieldKey];
      const next = { ...prev, fields };
      localStorage.setItem(STORAGE_KEY(groupId, characterId), JSON.stringify(next));
      return next;
    });
  }, [groupId, characterId]);

  const toggleItem = useCallback((itemId: number) => {
    setSettings(prev => {
      const items = prev.items.includes(itemId)
        ? prev.items.filter(id => id !== itemId)
        : [...prev.items, itemId];
      const next = { ...prev, items };
      localStorage.setItem(STORAGE_KEY(groupId, characterId), JSON.stringify(next));
      return next;
    });
  }, [groupId, characterId]);

  const toggleEquipped = useCallback((itemId: number) => {
    setSettings(prev => {
      const equipped = prev.equipped.includes(itemId)
        ? prev.equipped.filter(id => id !== itemId)
        : [...prev.equipped, itemId];
      const next = { ...prev, equipped };
      localStorage.setItem(STORAGE_KEY(groupId, characterId), JSON.stringify(next));
      return next;
    });
  }, [groupId, characterId]);

  const togglePinnedSkill = useCallback((skillId: number) => {
    setSettings(prev => {
      const pinnedSkills = prev.pinnedSkills.includes(skillId)
        ? prev.pinnedSkills.filter(id => id !== skillId)
        : [...prev.pinnedSkills, skillId];
      const next = { ...prev, pinnedSkills };
      localStorage.setItem(STORAGE_KEY(groupId, characterId), JSON.stringify(next));
      return next;
    });
  }, [groupId, characterId]);

  const isFieldOnDashboard = useCallback((fieldKey: string) => settings.fields.includes(fieldKey), [settings.fields]);
  const isItemResource = useCallback((itemId: number) => settings.items.includes(itemId), [settings.items]);
  const isItemEquipped = useCallback((itemId: number) => settings.equipped.includes(itemId), [settings.equipped]);
  const isSkillPinned = useCallback((skillId: number) => settings.pinnedSkills.includes(skillId), [settings.pinnedSkills]);

  return {
    settings,
    saveSettings,
    toggleField,
    toggleItem,
    toggleEquipped,
    togglePinnedSkill,
    isFieldOnDashboard,
    isItemResource,
    isItemEquipped,
    isSkillPinned,
  };
}
