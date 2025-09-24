// pages/CharacterSkills.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterSkill } from '../../types/characterSkills';
import { GroupSkill, SkillAttributeDefinition, SkillGroup } from '../../types/groupSkills';
import { characterSkillsAPI, groupSkillsAPI } from '../../services/api';
import CharacterSkillModal from '../../components/Modals/SkillModal/CharacterSkillModal';
import SkillCard from '../../components/Cards/SkillCard/SkillCard';
import List from '../../components/List/List';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import { usePlatform } from '../../hooks/usePlatform';
import GroupSection from '../../components/Cards/SkillCard/GroupSection';

const CharacterSkills: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const isMobile = usePlatform();
  const [skills, setSkills] = useState<CharacterSkill[]>([]);
  const [groupSkills, setGroupSkills] = useState<GroupSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { canEditThisCharacter } = useActionPermissions();
  const [attributes, setAttributes] = useState<SkillAttributeDefinition[]>([]);

  useEffect(() => {
    if (groupId && characterId) {
      loadSkills();
      loadGroupSkills();
      loadAttributes();
    }
  }, [groupId, characterId]);

  const loadAttributes = async () => {
    try {
      const attributesData = await groupSkillsAPI.getSkillAttributes(parseInt(groupId!));
      setAttributes(attributesData);
    } catch (err) {
      console.error('Failed to load attributes:', err);
    }
  };

  const loadSkills = async () => {
    try {
      setLoading(true);
      const skillsData = await characterSkillsAPI.getCharacterSkills(
        parseInt(groupId!), 
        parseInt(characterId!)
      );
      setSkills(skillsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupSkills = async () => {
    try {
      const skillsData = await groupSkillsAPI.getSkills(parseInt(groupId!));
      setGroupSkills(skillsData);
    } catch (err) {
      console.error('Failed to load group skills:', err);
    }
  };

  const handleAddSkill = async (skillId: number) => {
    try {
      await characterSkillsAPI.addSkillToCharacter(
        parseInt(groupId!), 
        parseInt(characterId!), 
        skillId
      );
      loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту способность у персонажа?')) return;

    try {
      await characterSkillsAPI.removeSkillFromCharacter(
        parseInt(groupId!), 
        parseInt(characterId!), 
        skillId
      );
      loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove skill');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const groupSkillsByAttributes = useMemo((): SkillGroup[] => {
    if (!skills.length || !attributes.length) return [];

    // Получаем атрибуты для группировки (только с isFiltered: true)
    const filteredAttributes = attributes.filter(attr => attr.isFiltered);
    
    if (!filteredAttributes.length) {
      // Если нет фильтруемых атрибутов, возвращаем одну группу "Все навыки"
      return [{
        name: 'Все навыки',
        attributeKey: '',
        skills: skills,
        children: []
      }];
    }

    // Рекурсивная функция для создания вложенной группировки
    const createGroups = (
      currentSkills: GroupSkill[], 
      attrs: SkillAttributeDefinition[], 
      level: number = 0
    ): SkillGroup[] => {
      if (level >= attrs.length || !currentSkills.length) {
        return [];
      }

      const currentAttr = attrs[level];
      const groupsMap = new Map<string, GroupSkill[]>();

      // Группируем навыки по текущему атрибуту
      currentSkills.forEach(skill => {
        const attribute = skill.attributes.find(attr => attr.key === currentAttr.key);
        const value = attribute?.value || 'Другое';
        
        if (!groupsMap.has(value)) {
          groupsMap.set(value, []);
        }
        groupsMap.get(value)!.push(skill);
      });

      // Создаем группы для текущего уровня
      const groups: SkillGroup[] = [];
      groupsMap.forEach((groupSkills, value) => {
        const groupName = value === 'Другое' ? 'Другое' : 
                          currentAttr.knownValues.includes(value) ? currentAttr.name + ": " + value : 'Другое';
        
        groups.push({
          name: groupName,
          attributeKey: currentAttr.key,
          skills: level === attrs.length - 1 ? groupSkills : [],
          children: level < attrs.length - 1 ? 
                    createGroups(groupSkills, attrs, level + 1) : []
        });
      });

      // Сортируем группы: сначала известные значения, потом "Другое"
      return groups.sort((a, b) => {
        if (a.name === 'Другое') return 1;
        if (b.name === 'Другое') return -1;
        return a.name.localeCompare(b.name);
      });
    };

    return createGroups(skills, filteredAttributes);
  }, [skills, attributes]);

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <h1>Способности персонажа</h1>

      {error && <div className={commonStyles.error}>{error}</div>}

      {canEditThisCharacter && (
        <div className={commonStyles.actions}>
          <button 
            className={buttonStyles.button}
            onClick={() => setIsModalOpen(true)}
          >
            Добавить способность
          </button>
        </div>
      )}

      <div className={commonStyles.list}>
        <h2>Список способностей</h2>
        {skills.length === 0 ? (
          <p>Способностей пока нет</p>
        ) : (
          <List layout={"vertical"} gap="medium" gridSize='large'>
            {groupSkillsByAttributes.map((group, index) => (
              <GroupSection
                key={index}
                group={group}
                level={0}
                isMobile={isMobile}
                onDeleteSkill={canEditThisCharacter ? handleRemoveSkill : undefined}
                showActions={canEditThisCharacter}
              />
            ))}
          </List>
        )}
      </div>

      {canEditThisCharacter && (
        <CharacterSkillModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddSkill={handleAddSkill}
          groupSkills={groupSkills}
          existingSkills={skills}
          title="Добавление способности персонажу"
        />
      )}
    </div>
  );
};

export default CharacterSkills;