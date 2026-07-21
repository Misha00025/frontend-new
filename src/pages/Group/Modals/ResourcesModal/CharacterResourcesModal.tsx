import React, { useState, useEffect } from 'react';
import { CharacterTemplate } from '../../../../types/characterTemplates';
import { groupAPI } from '../../../../services/api';
import buttonStyles from '../../../../styles/components/Button.module.css';
import modalStyles from '../../../../styles/modal.module.css';
import styles from './CharacterResourcesModal.module.css';

interface CharacterResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  templates: CharacterTemplate[];
}

const CharacterResourcesModal: React.FC<CharacterResourcesModalProps> = ({
  isOpen,
  onClose,
  groupId,
  templates,
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Collect all unique field keys from all templates
  const allFieldKeys = Array.from(
    new Set(
      templates.flatMap(t => Object.keys(t.fields))
    )
  );

  useEffect(() => {
    if (isOpen) {
      loadCurrentResources();
    }
  }, [isOpen, groupId]);

  const loadCurrentResources = async () => {
    try {
      const fields = await groupAPI.getCharacterResources(groupId);
      setSelectedFields(fields);
    } catch (err) {
      console.error('Failed to load character resources:', err);
      setSelectedFields([]);
    }
  };

  const toggleField = (fieldKey: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await groupAPI.updateCharacterResources(groupId, selectedFields);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const getFieldName = (fieldKey: string): string => {
    // Try to get the display name from any template
    for (const t of templates) {
      const field = t.fields[fieldKey];
      if (field) return field.name;
    }
    return fieldKey;
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={modalStyles.modal} onClick={e => e.stopPropagation()}>
        <h2>Поля на главной странице персонажа</h2>
        <p className={styles.hint}>
          Выберите поля, которые будут отображаться на дашборде персонажа и на карточках в списке персонажей.
          Эти поля GM считает основными ресурсами (HP, Gold, MP и т.д.).
        </p>

        {error && <div className={modalStyles.error}>{error}</div>}

        {allFieldKeys.length === 0 ? (
          <p className={styles.empty}>Нет доступных полей. Сначала создайте шаблоны персонажей с полями.</p>
        ) : (
          <div className={styles.fieldList}>
            {allFieldKeys.map(fieldKey => (
              <label key={fieldKey} className={styles.fieldItem}>
                <input
                  type="checkbox"
                  checked={selectedFields.includes(fieldKey)}
                  onChange={() => toggleField(fieldKey)}
                />
                <span className={styles.fieldName}>{getFieldName(fieldKey)}</span>
                <span className={styles.fieldKey}>{fieldKey}</span>
              </label>
            ))}
          </div>
        )}

        <div className={modalStyles.buttons}>
          <button className={buttonStyles.button} onClick={onClose}>
            Отмена
          </button>
          <button
            className={buttonStyles.button}
            onClick={handleSave}
            disabled={loading || allFieldKeys.length === 0}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterResourcesModal;
