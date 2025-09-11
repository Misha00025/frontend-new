import React, { useState } from 'react';
import { CreateGroupRequest, Group } from '../../types/group';
import { groupAPI } from '../../services/api';
import buttonStyles from '../../styles/components/Button.module.css';
import inputStyles from '../../styles/components/Input.module.css';
import styles from './CreateGroupModal.module.css';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (group: Group) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onGroupCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const groupData: CreateGroupRequest = {
        name,
        description: description || undefined,
        icon: icon || undefined,
      };
      
      const newGroup = await groupAPI.createGroup(groupData);
      onGroupCreated(newGroup);
      onClose();
      
      // Сброс формы
      setName('');
      setDescription('');
      setIcon('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Создать группу</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Название группы:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyles.input}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Описание (опционально):</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputStyles.input}
              rows={3}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Ссылка на иконку (опционально):</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className={inputStyles.input}
            />
          </div>
          
          <div className={styles.buttons}>
            <button type="button" onClick={onClose} className={buttonStyles.button}>
              Отмена
            </button>
            <button type="submit" className={buttonStyles.button} disabled={loading}>
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;