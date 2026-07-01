// components/Modals/SkillModal/CharacterSkillModal.tsx
import React, { useState, useEffect } from 'react';
import buttonStyles from '../../../../styles/components/Button.module.css';
import inputStyles from '../../../../styles/components/Input.module.css';
import modalStyles from '../../../../styles/modal.module.css';
import selectStyles from '../../../../styles/select-list.module.css';
import { GroupSkill } from '../../../../types/groupSkills';
import { CharacterSkill } from '../../../../types/characterSkills';

interface CharacterSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSkill: (skillId: number) => void;
  groupSkills: GroupSkill[];
  existingSkills: CharacterSkill[];
  title: string;
}

const CharacterSkillModal: React.FC<CharacterSkillModalProps> = ({
  isOpen,
  onClose,
  onAddSkill,
  groupSkills,
  existingSkills,
  title
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('');
  const [filteredSkills, setFilteredSkills] = useState<GroupSkill[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем уникальные атрибуты из всех навыков группы
  useEffect(() => {
    if (isOpen) {
      const attributes = new Set<string>();
      groupSkills.forEach(skill => {
        skill.attributes.forEach(attr => {
          attributes.add(attr.name);
        });
      });
      setAvailableAttributes(Array.from(attributes));
    }
  }, [groupSkills, isOpen]);

  // Фильтрация навыков
  useEffect(() => {
    if (!isOpen) return;

    let result = groupSkills.filter(skill => 
      !existingSkills.some(existing => existing.id === skill.id)
    );

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(skill => 
        skill.name.toLowerCase().includes(term) ||
        skill.description.toLowerCase().includes(term) ||
        skill.attributes.some(attr => 
          attr.name.toLowerCase().includes(term) ||
          attr.value.toLowerCase().includes(term)
        )
      );
    }

    if (selectedAttribute) {
      result = result.filter(skill =>
        skill.attributes.some(attr => attr.name === selectedAttribute)
      );
    }

    setFilteredSkills(result);
  }, [groupSkills, existingSkills, searchTerm, selectedAttribute, isOpen]);

  const handleAddSkill = async (skill: GroupSkill) => {
    setLoading(true);
    setError(null);

    try {
      await onAddSkill(skill.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const getAttributeValue = (skill: GroupSkill, attributeName: string): string => {
    const attribute = skill.attributes.find(attr => attr.name === attributeName);
    return attribute ? attribute.value : '-';
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <h2>{title}</h2>
        
        {error && <div className={modalStyles.error}>{error}</div>}
        
        <div className={selectStyles.filters}>
          <div className={selectStyles.searchGroup}>
            <label>Поиск:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputStyles.input}
              placeholder="Название, описание или атрибут..."
            />
          </div>
          
          <div className={selectStyles.filterGroup}>
            <label>Фильтр по атрибуту:</label>
            <select
              value={selectedAttribute}
              onChange={(e) => setSelectedAttribute(e.target.value)}
              className={inputStyles.input}
            >
              <option value="">Все атрибуты</option>
              {availableAttributes.map(attr => (
                <option key={attr} value={attr}>{attr}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={selectStyles.sectionList}>
          <h3>Доступные способности ({filteredSkills.length})</h3>
          
          {filteredSkills.length === 0 ? (
            <p className={selectStyles.noItems}>Нет доступных способностей для добавления</p>
          ) : (
            <div className={selectStyles.listContainer}>
              {filteredSkills.map(skill => (
                <div key={skill.id} className={selectStyles.listItem}>
                  <div className={selectStyles.itemHeader}>
                    <h4 className={selectStyles.itemName}>{skill.name}</h4>
                    <button
                      onClick={() => handleAddSkill(skill)}
                      className={buttonStyles.button}
                      disabled={loading}
                    >
                      {loading ? 'Добавление...' : 'Добавить'}
                    </button>
                  </div>
                  
                  <p className={selectStyles.itemDescription}>{skill.description}</p>
                  
                  <div className={selectStyles.attributes}>
                    <h5>Атрибуты:</h5>
                    <div className={selectStyles.attributesGrid}>
                      {availableAttributes.map(attrName => (
                        <div key={attrName} className={selectStyles.attribute}>
                          <span className={selectStyles.attributeName}>{attrName}:</span>
                          <span className={selectStyles.attributeValue}>
                            {getAttributeValue(skill, attrName)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={modalStyles.buttons}>
          <button type="button" onClick={onClose} className={buttonStyles.button}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSkillModal;