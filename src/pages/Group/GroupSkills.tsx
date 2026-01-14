// GroupSkills.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GroupSkill } from '../../types/groupSkills';
import { groupAPI, groupSkillsAPI } from '../../services/api';
import SkillCard from '../../components/Cards/SkillCard/SkillCard';
import SkillModal from '../../components/Modals/SkillModal/SkillModal';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import ResourcePage from '../../components/commons/Pages/ResourcePage/ResourcePage';
import SchemaModal from '../../components/Modals/ShcemaModal/SchemaModal';

const SkillCardWrapper: React.FC<{
  item: GroupSkill;
  onEdit?: (item: GroupSkill) => void;
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

const GroupSkills: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [skills, setSkills] = useState<GroupSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<GroupSkill | null>(null);
  const { canEditGroup } = useActionPermissions();
  const [schema, setSchema] = useState<string[]>([]);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  
  useEffect(() => {
    if (groupId) {
      loadSchema();
      loadSkills();
    }
  }, [groupId]);
  
  
  const loadSchema = async () => {
    try {
      const schemaData = await groupAPI.getSkillsSchema(parseInt(groupId!));
      setSchema(schemaData.groupBy);
    } catch (err) {
      console.error('Failed to load schema:', err);
      // При ошибке используем пустую схему
      setSchema([]);
    }
  };

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
  
  const handleCreate = () => {
    setEditingSkill(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (skill: GroupSkill) => {
    setEditingSkill(skill);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (skillId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот навык?')) return;
    
    try {
      await groupSkillsAPI.deleteSkill(parseInt(groupId!), skillId);
      loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
    }
  };
  
  const handleSaveSkill = async (skillData: any) => {
    if (editingSkill) {
      await groupSkillsAPI.updateSkill(parseInt(groupId!), editingSkill.id, skillData);
    } else {
      await groupSkillsAPI.createSkill(parseInt(groupId!), skillData);
    }
    
    setIsModalOpen(false);
    setEditingSkill(null);
    loadSkills();
  };

  const handleConfigureSchema = () => {
    setIsSchemaModalOpen(true);
  };
  
  const handleSaveSchema = async (newSchema: string[]) => {
    try {
      await groupAPI.updateSkillsSchema(parseInt(groupId!), newSchema);
      setSchema(newSchema);
      setIsSchemaModalOpen(false);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save schema');
    }
  };

  const availableAttributes = Array.from(
    new Set(
      skills.flatMap(skill => 
        skill.attributes?.map(attr => attr.name) || []
      )
    )
  ).sort();
  
  const config = {
    ItemComponent: SkillCardWrapper,
    titles: {
      page: 'Книга способностей',
    },
    groupByAttributes: schema,
  };
  
  return (
    <>
      <ResourcePage
        config={config}
        items={skills}
        loading={loading}
        error={error}
        canCreate={canEditGroup}
        canEdit={canEditGroup}
        canDelete={canEditGroup}
        canConfigureSchema={canEditGroup}
        onConfigureSchema={handleConfigureSchema}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {canEditGroup && (
        <>
        <SkillModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSkill(null);
          }}
          onSave={handleSaveSkill}
          editingSkill={editingSkill}
          title={editingSkill ? 'Редактирование навыка' : 'Создание навыка'}
          availableAttributes={[]}
          possibleValuesForFilteredAttributes={{}}
        />
        
        <SchemaModal
          isOpen={isSchemaModalOpen}
          onClose={() => setIsSchemaModalOpen(false)}
          onSave={handleSaveSchema}
          availableAttributes={availableAttributes}
          currentSchema={schema}
          title="Настройка схемы группировки навыков"
        />
      </>
      )}
    </>
  );
};

export default GroupSkills;