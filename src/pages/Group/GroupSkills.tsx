// pages/GroupSkills.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import SearchBar from '../../components/commons/Search/SearchBar';

const GroupSkills: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const isMobile = usePlatform();
  const [skills, setSkills] = useState<GroupSkill[]>([]);
  const [allSkills, setAllSkills] = useState<GroupSkill[]>([]); // Все навыки без фильтрации
  const [attributes, setAttributes] = useState<SkillAttributeDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<GroupSkill | null>(null);
  const { canEditGroup } = useActionPermissions();
  const [lastUpdatedSkillId, setLastUpdatedSkillId] = useState<number | null>(null);
  
  // Состояния для поиска и фильтрации
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('');
  const [attributeValue, setAttributeValue] = useState<string>('');

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
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [lastUpdatedSkillId, skills]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const skillsData = await groupSkillsAPI.getSkills(parseInt(groupId!));
      setAllSkills(skillsData);
      setSkills(skillsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация навыков
  useEffect(() => {
    if (!allSkills.length) return;

    let filtered = [...allSkills];

    // Поиск по тексту
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(term) ||
        skill.description.toLowerCase().includes(term) ||
        skill.attributes.some(attr => 
          attr.name.toLowerCase().includes(term) ||
          attr.value.toLowerCase().includes(term)
        )
      );
    }

    // Фильтрация по атрибуту
    if (selectedAttribute) {
      filtered = filtered.filter(skill =>
        skill.attributes.some(attr => {
          if (attributeValue) {
            return attr.name === selectedAttribute && attr.value === attributeValue;
          }
          return attr.name === selectedAttribute;
        })
      );
    }

    setSkills(filtered);
  }, [allSkills, searchTerm, selectedAttribute, attributeValue]);

  // Получение возможных значений для атрибутов
  const getPossibleValuesForFilteredAttributes = useCallback(() => {
    const possibleValues: { [key: string]: string[] } = {};
    
    attributes
      .filter(attr => attr.isFiltered)
      .forEach(attr => {
        const values = new Set<string>();
        allSkills.forEach(skill => {
          const skillAttr = skill.attributes.find(a => a.key === attr.key);
          if (skillAttr) {
            values.add(skillAttr.value);
          }
        });
        possibleValues[attr.key] = Array.from(values);
        possibleValues[attr.key].sort();
      });
    return possibleValues;
  }, [allSkills, attributes]);

  // Получение уникальных атрибутов для фильтрации
  const availableAttributes = useMemo(() => {
    const attrs = new Set<string>();
    allSkills.forEach(skill => {
      skill.attributes.forEach(attr => {
        attrs.add(attr.name);
      });
    });
    return Array.from(attrs);
  }, [allSkills]);

  // Получение возможных значений для выбранного атрибута
  const attributeValues = useMemo(() => {
    if (!selectedAttribute) return [];
    const values = new Set<string>();
    allSkills.forEach(skill => {
      skill.attributes.forEach(attr => {
        if (attr.name === selectedAttribute) {
          values.add(attr.value);
        }
      });
    });
    return Array.from(values).sort();
  }, [allSkills, selectedAttribute]);

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
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedAttribute('');
    setAttributeValue('');
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <h1>Книга способностей</h1>

      {error && <div className={commonStyles.error}>{error}</div>}

      {/* Панель поиска и фильтрации */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedAttribute={selectedAttribute}
        onAttributeChange={(attr) => {
          setSelectedAttribute(attr);
          setAttributeValue(''); // Сбрасываем значение при смене атрибута
        }}
        attributeValue={attributeValue}
        onAttributeValueChange={setAttributeValue}
        availableAttributes={availableAttributes}
        attributeValues={attributeValues}
        onClearFilters={handleClearFilters}
        resultsCount={skills.length}
        totalCount={allSkills.length}
        placeholder="Поиск по названию, описанию или атрибуту..."
        attributeLabel="Атрибут"
        valueLabel="Значение"
      />

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
        {skills.length === 0 && !loading && (
          <div className={commonStyles.noResults}>
            <p>По вашему запросу ничего не найдено</p>
            <button 
              className={buttonStyles.button}
              onClick={handleClearFilters}
            >
              Очистить фильтры
            </button>
          </div>
        )}
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