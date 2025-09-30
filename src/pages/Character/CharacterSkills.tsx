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
import { groupSkillsByAttributes } from '../../utils/groupSkillsByAttributes';

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
            {groupSkillsByAttributes(skills, attributes).map((group, index) => (
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