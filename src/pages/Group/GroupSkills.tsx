// pages/GroupSkills.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GroupSkill, SkillAttributeDefinition } from '../../types/groupSkills';
import { groupSkillsAPI } from '../../services/api';
import SkillCard from '../../components/Cards/SkillCard/SkillCard';
import SkillModal from '../../components/Modals/SkillModal/SkillModal';
import SkillAttributesModal from '../../components/Modals/SkillAttributesModal/SkillAttributesModal';
import List from '../../components/List/List';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import { usePlatform } from '../../hooks/usePlatform';

const GroupSkills: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const isMobile = usePlatform();
  const [skills, setSkills] = useState<GroupSkill[]>([]);
  const [attributes, setAttributes] = useState<SkillAttributeDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<GroupSkill | null>(null);
  const { canEditGroup } = useActionPermissions();

  useEffect(() => {
    if (groupId) {
      loadSkills();
      loadAttributes();
    }
  }, [groupId]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const skillsData = await groupSkillsAPI.getSkills(parseInt(groupId!));
      setSkills(skillsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const loadAttributes = async () => {
    try {
      const attributesData = await groupSkillsAPI.getSkillAttributes(parseInt(groupId!));
      setAttributes(attributesData);
    } catch (err) {
      console.error('Failed to load attributes:', err);
    }
  };

  const handleCreateSkill = async (skillData: any) => {
    await groupSkillsAPI.createSkill(parseInt(groupId!), skillData);
    loadSkills();
  };

  const handleUpdateSkill = async (skillData: any) => {
    if (!editingSkill) return;
    await groupSkillsAPI.updateSkill(parseInt(groupId!), editingSkill.id, skillData);
    loadSkills();
  };

  const handleDeleteSkill = async (skillId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот навык?')) return;

    try {
      await groupSkillsAPI.deleteSkill(parseInt(groupId!), skillId);
      loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
    }
  };

  const handleUpdateAttributes = async (updatedAttributes: SkillAttributeDefinition[]) => {
    try {
      await groupSkillsAPI.updateSkillAttributes(parseInt(groupId!), updatedAttributes);
      const freshAttributes = await groupSkillsAPI.getSkillAttributes(parseInt(groupId!));
      setAttributes(freshAttributes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update attributes');
    }
  };

  const handleEditSkill = (skill: GroupSkill) => {
    setEditingSkill(skill);
    setIsSkillModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsSkillModalOpen(false);
    setIsAttributesModalOpen(false);
    setEditingSkill(null);
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <h1>Способности группы</h1>

      {error && <div className={commonStyles.error}>{error}</div>}

      {canEditGroup && (
        <div className={commonStyles.actions}>
          <button 
            className={buttonStyles.button}
            onClick={() => setIsSkillModalOpen(true)}
          >
            Создать навык
          </button>
          <button 
            className={buttonStyles.button}
            onClick={() => setIsAttributesModalOpen(true)}
          >
            Редактировать атрибуты
          </button>
        </div>
      )}

      <List layout={isMobile ? "vertical" : "grid"} gap="medium" gridSize='large'>
        {skills.map(skill => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onEdit={canEditGroup ? () => handleEditSkill(skill) : undefined}
            onDelete={canEditGroup ? () => handleDeleteSkill(skill.id) : undefined}
            showActions={canEditGroup}
          />
        ))}
      </List>

      {canEditGroup && (
        <>
          <SkillModal 
            isOpen={isSkillModalOpen}
            onClose={handleCloseModals}
            onSave={editingSkill ? handleUpdateSkill : handleCreateSkill}
            editingSkill={editingSkill}
            availableAttributes={attributes}
            title={editingSkill ? 'Редактирование навыка' : 'Создание навыка'}
          />

          <SkillAttributesModal 
            isOpen={isAttributesModalOpen}
            onClose={handleCloseModals}
            onSave={handleUpdateAttributes}
            attributes={attributes}
            title="Редактирование атрибутов навыков"
          />
        </>
      )}
    </div>
  );
};

export default GroupSkills;