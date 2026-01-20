// components/Modals/SkillModal/CharacterSkillModal.tsx
import React, { useState, useEffect } from 'react';
import buttonStyles from '../../../../styles/components/Button.module.css';
import inputStyles from '../../../../styles/components/Input.module.css';
import styles from './CharacterSkillModal.module.css';
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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{title}</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.filters}>
          <div className={styles.searchGroup}>
            <label>Поиск:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputStyles.input}
              placeholder="Название, описание или атрибут..."
            />
          </div>
          
          <div className={styles.filterGroup}>
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

        <div className={styles.skillsList}>
          <h3>Доступные способности ({filteredSkills.length})</h3>
          
          {filteredSkills.length === 0 ? (
            <p className={styles.noSkills}>Нет доступных способностей для добавления</p>
          ) : (
            <div className={styles.skillsContainer}>
              {filteredSkills.map(skill => (
                <div key={skill.id} className={styles.skillItem}>
                  <div className={styles.skillHeader}>
                    <h4 className={styles.skillName}>{skill.name}</h4>
                    <button
                      onClick={() => handleAddSkill(skill)}
                      className={buttonStyles.button}
                      disabled={loading}
                    >
                      {loading ? 'Добавление...' : 'Добавить'}
                    </button>
                  </div>
                  
                  <p className={styles.skillDescription}>{skill.description}</p>
                  
                  <div className={styles.attributes}>
                    <h5>Атрибуты:</h5>
                    <div className={styles.attributesGrid}>
                      {availableAttributes.map(attrName => (
                        <div key={attrName} className={styles.attribute}>
                          <span className={styles.attributeName}>{attrName}:</span>
                          <span className={styles.attributeValue}>
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

        <div className={styles.buttons}>
          <button type="button" onClick={onClose} className={buttonStyles.button}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSkillModal;