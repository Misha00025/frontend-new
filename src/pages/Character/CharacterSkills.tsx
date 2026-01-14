// pages/CharacterSkills.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterSkill } from '../../types/characterSkills';
import { CreateGroupSkillRequest, GroupSkill, SkillAttributeDefinition, SkillGroup, UpdateGroupSkillRequest } from '../../types/groupSkills';
import { characterSkillsAPI, groupSkillsAPI } from '../../services/api';
import CharacterSkillModal from '../../components/Modals/SkillModal/CharacterSkillModal';
import SkillCard from '../../components/Cards/SkillCard/SkillCard';
import commonStyles from '../../styles/common.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import { usePlatform } from '../../hooks/usePlatform';
import SkillModal from '../../components/Modals/SkillModal/SkillModal';
import ResourcePage from '../../components/commons/Pages/ResourcePage/ResourcePage';

const SkillCardWrapper: React.FC<{
  item: CharacterSkill;
  onEdit?: (item: CharacterSkill) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}> = ({ item, onEdit, onDelete, showActions }) => {
  return (
    <SkillCard
      skill={item}
      onEdit={onEdit ? () => onEdit(item) : undefined}
      onDelete={onDelete ? () => onDelete(item.id) : undefined}
      showActions={showActions}
    />
  );
};

const CharacterSkills: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const isMobile = usePlatform();
  const [skills, setSkills] = useState<CharacterSkill[]>([]);
  const [groupSkills, setGroupSkills] = useState<GroupSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const { canEditThisCharacter, canEditGroup } = useActionPermissions();
  const [attributes, setAttributes] = useState<SkillAttributeDefinition[]>([]);
  const [editingSkill, setEditingSkill] = useState<GroupSkill | null>(null);

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


  
  const getPossibleValuesForFilteredAttributes = useCallback(() => {
    const possibleValues: { [key: string]: string[] } = {};
    
    attributes
      .filter(attr => attr.isFiltered)
      .forEach(attr => {
        const values = new Set<string>();
        skills.forEach(skill => {
          const skillAttr = skill.attributes.find(a => a.key === attr.key);
          if (skillAttr) {
            values.add(skillAttr.value);
          }
        });
        possibleValues[attr.key] = Array.from(values);
        possibleValues[attr.key].sort();
      });
    return possibleValues;
  }, [skills, attributes]);

  const handleCreateSkill = async (skillData: any) => {
      await groupSkillsAPI.createSkill(parseInt(groupId!), skillData);
      loadSkills();
    };
  
  const handleUpdateSkill = async (skillData: any) => {
    if (!editingSkill) return;
    await groupSkillsAPI.updateSkill(parseInt(groupId!), editingSkill.id, skillData);
    loadSkills();
  };

  
  const handleEditSkill = (skill: GroupSkill) => {
    setEditingSkill(skill);
    setIsSkillModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const config = {
    ItemComponent: SkillCardWrapper,
    titles: {
      page: 'Способности',
      create: 'Добавить'
    },
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <>
      <ResourcePage
        config={config}
        items={skills}
        loading={loading}
        error={error}
        canCreate={canEditThisCharacter}
        canEdit={canEditThisCharacter}
        canDelete={canEditThisCharacter}
        onCreate={() => setIsModalOpen(true)}
        onEdit={canEditGroup ? handleEditSkill : undefined}
        onDelete={canEditThisCharacter ? handleRemoveSkill : undefined}
      />

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

      {canEditGroup && (
        <SkillModal 
          isOpen={isSkillModalOpen}
          onClose={() => {setIsSkillModalOpen(false); setEditingSkill(null)}}
          onSave={editingSkill ? handleUpdateSkill : handleCreateSkill}
          editingSkill={editingSkill}
          availableAttributes={attributes}
          possibleValuesForFilteredAttributes={getPossibleValuesForFilteredAttributes()}
          title={editingSkill ? 'Редактирование навыка' : 'Создание навыка'}
        />
      )}
    </>
  );
};

export default CharacterSkills;