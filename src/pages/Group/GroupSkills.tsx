// pages/GroupSkills.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { GroupSkill, SkillAttributeDefinition, SkillGroup } from '../../types/groupSkills';
import { groupSkillsAPI } from '../../services/api';
import SkillModal from '../../components/Modals/SkillModal/SkillModal';
import SkillAttributesModal from '../../components/Modals/SkillAttributesModal/SkillAttributesModal';
import List from '../../components/List/List';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import { usePlatform } from '../../hooks/usePlatform';
import GroupSection from '../../components/Cards/SkillCard/GroupSection';
import { groupSkillsByAttributes } from '../../utils/groupSkillsByAttributes';

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
  const [lastUpdatedSkillId, setLastUpdatedSkillId] = useState<number | null>(null);

  useEffect(() => {
    if (groupId) {
      loadSkills();
      loadAttributes();
    }
  }, [groupId]);

  useEffect(() => {
    if (lastUpdatedSkillId) {
      setTimeout(() => {
        const element = document.getElementById(`skill-${lastUpdatedSkillId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }, [lastUpdatedSkillId, skills]);

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

  const loadAttributes = async () => {
    try {
      const attributesData = await groupSkillsAPI.getSkillAttributes(parseInt(groupId!));
      setAttributes(attributesData);
    } catch (err) {
      console.error('Failed to load attributes:', err);
    }
  };

  const handleCreateSkill = async (skillData: any) => {
    const newSkill = await groupSkillsAPI.createSkill(parseInt(groupId!), skillData);
    setLastUpdatedSkillId(newSkill.id);
    loadSkills();
  };

  const handleUpdateSkill = async (skillData: any) => {
    if (!editingSkill) return;
    const updatedSkill = await groupSkillsAPI.updateSkill(parseInt(groupId!), editingSkill.id, skillData);
    setLastUpdatedSkillId(updatedSkill.id);
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

  const checkContainSkill = (group: SkillGroup) => {
    var success: boolean = false
    group.skills.forEach((skill) => {
      success = success || skill.id == lastUpdatedSkillId
    })
    if (!success){
      group.children.forEach((child) => {
        success = success || checkContainSkill(child)
      })
    }
    return success
  }

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <h1>Книга способностей</h1>

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

      <List layout={"vertical"} gap="medium" gridSize='small'>
      {groupSkillsByAttributes(skills, attributes).map((group, index) => (
        <GroupSection
          key={index}
          group={group}
          level={0}
          isMobile={isMobile}
          onEditSkill={canEditGroup ? handleEditSkill : undefined}
          onDeleteSkill={canEditGroup ? handleDeleteSkill : undefined}
          showActions={canEditGroup}
          collapse={!checkContainSkill(group)}
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
            possibleValuesForFilteredAttributes={getPossibleValuesForFilteredAttributes()}
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