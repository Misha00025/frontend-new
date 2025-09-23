// pages/GroupSkills.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { GroupSkill, SkillAttributeDefinition, SkillGroup } from '../../types/groupSkills';
import { groupSkillsAPI } from '../../services/api';
import SkillCard from '../../components/Cards/SkillCard/SkillCard';
import SkillModal from '../../components/Modals/SkillModal/SkillModal';
import SkillAttributesModal from '../../components/Modals/SkillAttributesModal/SkillAttributesModal';
import List from '../../components/List/List';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import { usePlatform } from '../../hooks/usePlatform';
import GroupSection from '../../components/Cards/SkillCard/GroupSection';

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

      <List layout={"vertical"} gap="medium" gridSize='small'>
      {groupSkillsByAttributes.map((group, index) => (
        <GroupSection
          key={index}
          group={group}
          level={0}
          isMobile={isMobile}
          onEditSkill={canEditGroup ? handleEditSkill : undefined}
          onDeleteSkill={canEditGroup ? handleDeleteSkill : undefined}
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