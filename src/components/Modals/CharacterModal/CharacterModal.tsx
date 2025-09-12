import React, { useState, useEffect } from 'react';
import { CharacterTemplate } from '../../../types/characterTemplates';
import { CreateCharacterRequest } from '../../../types/characters';
import buttonStyles from '../../../styles/components/Button.module.css';
import inputStyles from '../../../styles/components/Input.module.css';
import styles from './CharacterModal.module.css';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (characterData: CreateCharacterRequest) => Promise<void>;
  templates: CharacterTemplate[];
  title: string;
}

const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  templates,
  title
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Сброс формы при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setTemplateId(templates.length > 0 ? templates[0].id : 0);
    }
  }, [isOpen, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const characterData: CreateCharacterRequest = {
        name,
        description,
        templateId,
      };

      await onSave(characterData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{title}</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Название персонажа:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Описание персонажа:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputStyles.input}
              rows={3}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Шаблон персонажа:</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(parseInt(e.target.value))}
              className={inputStyles.input}
              required
            >
              <option value={0}>Выберите шаблон</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.buttons}>
            <button type="button" onClick={onClose} className={buttonStyles.button}>
              Отмена
            </button>
            <button type="submit" className={buttonStyles.button} disabled={loading || templateId === 0}>
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterModal;