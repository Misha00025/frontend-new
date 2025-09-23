// components/GroupSection/GroupSection.tsx
import React from 'react';
import { GroupSkill, SkillGroup } from '../../../types/groupSkills';
import List from '../../List/List';
import SkillCard from './SkillCard';

interface GroupSectionProps {
  group: SkillGroup;
  level: number;
  isMobile: boolean;
  onEditSkill?: (skill: GroupSkill) => void;
  onDeleteSkill?: (skillId: number) => void;
  showActions?: boolean;
}

const GroupSection: React.FC<GroupSectionProps> = ({
  group,
  level,
  isMobile,
  onEditSkill,
  onDeleteSkill,
  showActions
}) => {
  return (
    <div style={{ marginLeft: level * 20 }}>
      <div style={{ 
        padding: '10px 0', 
        borderBottom: '1px solid #eee',
        fontSize: level === 0 ? '1.5em' : level === 1 ? '1.2em' : '1em',
        fontWeight: 'bold',
        marginBottom: '10px'
      }}>
        {group.name}
      </div>

      {group.skills.length > 0 && (
        <List layout={isMobile ? "vertical" : "grid"} gap="medium" gridSize='large'>
          {group.skills.map(skill => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onEdit={showActions && onEditSkill ? () => onEditSkill(skill) : undefined}
              onDelete={showActions && onDeleteSkill ? () => onDeleteSkill(skill.id) : undefined}
              showActions={showActions}
            />
          ))}
        </List>
      )}

      {group.children.map((childGroup, index) => (
        <GroupSection
          key={index}
          group={childGroup}
          level={level + 1}
          isMobile={isMobile}
          onEditSkill={onEditSkill}
          onDeleteSkill={onDeleteSkill}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default GroupSection;