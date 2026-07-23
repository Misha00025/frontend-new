import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import buttonStyles from '../../../../styles/components/Button.module.css';
import inputStyles from '../../../../styles/components/Input.module.css';
import modalStyles from '../../../../styles/modal.module.css';
import ModalPortal from '../../../../components/commons/ModalPortal/ModalPortal';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from '../../../../contexts/ThemeContext';
import { usePlatform } from '../../../../hooks/usePlatform';
import { generateKey } from '../../../../utils/generateKey';
import type {
  QuestStatus,
  ObjectiveStatus,
  QuestObjective,
  GroupQuest,
  PatchGroupQuestRequest,
} from '../../../../types/groupQuests';
import viewStyles from './QuestViewModal.module.css';

interface QuestViewModalProps {
  quest: GroupQuest | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (questData: PatchGroupQuestRequest) => Promise<void>;
  onObjectiveStatusChange: (questId: number, objectiveKey: string, status: ObjectiveStatus) => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  characters?: Array<{ id: number; name: string }>;
}

const STATUS_OPTIONS: { value: QuestStatus; label: string }[] = [
  { value: 'active', label: 'Активен' },
  { value: 'completed', label: 'Завершён' },
  { value: 'failed', label: 'Провален' },
  { value: 'cancelled', label: 'Отменён' },
];

const OBJECTIVE_STATUS_OPTIONS: { value: ObjectiveStatus; label: string }[] = [
  { value: 'pending', label: 'В процессе' },
  { value: 'completed', label: 'Выполнена' },
  { value: 'failed', label: 'Провалена' },
  { value: 'cancelled', label: 'Отменена' },
];

const STATUS_LABEL_MAP: Record<QuestStatus, string> = {
  active: 'Активен',
  completed: 'Завершён',
  failed: 'Провален',
  cancelled: 'Отменён',
};

const STATUS_COLOR_MAP: Record<QuestStatus, string> = {
  active: '#4caf50',
  completed: '#2196f3',
  failed: '#f44336',
  cancelled: '#9e9e9e',
};

const QuestViewModal: React.FC<QuestViewModalProps> = ({
  quest,
  isOpen,
  onClose,
  onSave,
  onObjectiveStatusChange,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  characters,
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // edit mode state
  const [status, setStatus] = useState<QuestStatus>('active');
  const [header, setHeader] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState<string[]>([]);
  const [newReward, setNewReward] = useState('');
  const [objectives, setObjectives] = useState<QuestObjective[]>([]);
  const [assignedCharacters, setAssignedCharacters] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { themeConfig } = useTheme();
  const isMobile = usePlatform();
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode('view');
    setError(null);
    setLoading(false);
  }, [isOpen, quest]);

  useEffect(() => {
    if (mode === 'edit' && quest) {
      setStatus(quest.status);
      setHeader(quest.header);
      setDescription(quest.description);
      setReward([...quest.reward]);
      setObjectives(quest.objectives.map(o => ({ ...o })));
      setAssignedCharacters([...quest.assignedCharacters]);
    } else if (mode === 'edit') {
      setStatus('active');
      setHeader('');
      setDescription('');
      setReward([]);
      setObjectives([]);
      setAssignedCharacters([]);
    }
    setNewReward('');
    setError(null);
  }, [mode, quest]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editorRef.current?.contains(e.target as Node)) return;
      const isCtrl = e.ctrlKey || e.metaKey;
      if (!isCtrl) return;
      const keyMap: Record<string, string> = {
        KeyB: 'b',
        KeyI: 'i',
        KeyK: 'k',
        KeyL: 'l',
      };
      const key = keyMap[e.code];
      if (key) {
        e.preventDefault();
        const newEvent = new KeyboardEvent('keydown', {
          key,
          code: e.code,
          ctrlKey: true,
          metaKey: e.metaKey,
          bubbles: true,
          cancelable: true,
        });
        e.target?.dispatchEvent(newEvent);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddReward = () => {
    const trimmed = newReward.trim();
    if (!trimmed) return;
    setReward(prev => [...prev, trimmed]);
    setNewReward('');
  };

  const handleRemoveReward = (index: number) => {
    setReward(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddObjective = () => {
    const key = generateKey(`objective_${objectives.length}_${Date.now()}`);
    setObjectives(prev => [
      ...prev,
      { key, description: '', status: 'pending' },
    ]);
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(prev => prev.filter((_, i) => i !== index));
  };

  const handleObjectiveChange = (index: number, updates: Partial<QuestObjective>) => {
    setObjectives(prev =>
      prev.map((obj, i) => (i === index ? { ...obj, ...updates } : obj)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!header.trim()) {
      setError('Заголовок обязателен');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const questData: PatchGroupQuestRequest = {
        header: header.trim(),
        description,
        reward: reward.length > 0 ? reward : undefined,
        status,
        objectives: objectives.length > 0 ? objectives : undefined,
        assignedCharacters: assignedCharacters.length > 0 ? assignedCharacters : undefined,
      };
      await onSave(questData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const themeMode =
    themeConfig.type === 'preset' && themeConfig.name === 'dark'
      ? 'dark'
      : 'light';

  if (!quest) {
    return (
      <ModalPortal isOpen={isOpen} onClose={onClose}>
        <p>Загрузка квеста...</p>
      </ModalPortal>
    );
  }

  if (mode === 'edit') {
    return (
      <ModalPortal isOpen={isOpen} onClose={onClose}>
        <h2>{quest ? 'Редактирование квеста' : 'Создание квеста'}</h2>
        <div className={modalStyles.modalBody}>
          {error && <div className={modalStyles.error}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className={modalStyles.formGroup}>
              <label>Статус квеста:</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as QuestStatus)}
                className={inputStyles.input}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={modalStyles.formGroup}>
              <label>Заголовок:</label>
              <input
                type="text"
                value={header}
                onChange={e => setHeader(e.target.value)}
                className={inputStyles.input}
                required
                placeholder="Название квеста"
              />
            </div>

            <div className={modalStyles.formGroup}>
              <label>Описание:</label>
              <div
                ref={editorRef}
                className={viewStyles.editorContainer}
                data-color-mode={themeMode}
              >
                <MDEditor
                  value={description}
                  onChange={value => setDescription(value || '')}
                  preview="edit"
                  height={300}
                  style={{ width: '100%' }}
                  textareaProps={{
                    lang: 'ru',
                    spellCheck: true,
                  }}
                  previewOptions={{
                    disallowedElements: ['script', 'style'],
                  }}
                />
              </div>
              <div className={viewStyles.markdownHint}>
                Поддерживает Markdown: **жирный**, *курсив*, `код`, списки и многое другое.
              </div>
            </div>

            <div className={viewStyles.section}>
              <h3>Награды</h3>
              <div className={viewStyles.rewardList}>
                {reward.map((item, index) => (
                  <span key={index} className={viewStyles.rewardTag}>
                    {item}
                    <button
                      type="button"
                      className={viewStyles.rewardRemove}
                      onClick={() => handleRemoveReward(index)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className={viewStyles.rewardInputRow}>
                <input
                  type="text"
                  value={newReward}
                  onChange={e => setNewReward(e.target.value)}
                  className={inputStyles.input}
                  placeholder="Введите награду"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddReward();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddReward}
                  className={buttonStyles.button}
                >
                  Добавить награду
                </button>
              </div>
            </div>

            <div className={viewStyles.section}>
              <h3>Цели</h3>
              {objectives.map((obj, index) => (
                <div key={obj.key} className={viewStyles.objectiveItem}>
                  <div className={viewStyles.objectiveRow}>
                    <input
                      type="text"
                      value={obj.description}
                      onChange={e =>
                        handleObjectiveChange(index, {
                          description: e.target.value,
                        })
                      }
                      className={inputStyles.input}
                      placeholder="Описание цели"
                      required
                    />
                    <select
                      value={obj.status}
                      onChange={e =>
                        handleObjectiveChange(index, {
                          status: e.target.value as ObjectiveStatus,
                        })
                      }
                      className={inputStyles.input}
                    >
                      {OBJECTIVE_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={viewStyles.removeBtn}
                      onClick={() => handleRemoveObjective(index)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddObjective}
                className={buttonStyles.button}
              >
                Добавить цель
              </button>
            </div>

            <div className={viewStyles.section}>
              <h3>Назначенные персонажи</h3>
              {!characters || characters.length === 0 ? (
                <p className={viewStyles.noCharacters}>Нет доступных персонажей</p>
              ) : (
                <>
                  <div className={viewStyles.characterTags}>
                    {assignedCharacters.map(charId => {
                      const char = characters?.find(c => c.id === charId);
                      return (
                        <span key={charId} className={viewStyles.rewardTag}>
                          {char?.name || `ID: ${charId}`}
                          <button
                            type="button"
                            className={viewStyles.rewardRemove}
                            onClick={() => setAssignedCharacters(prev => prev.filter(id => id !== charId))}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <div className={viewStyles.rewardInputRow}>
                    <select
                      value=""
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        if (val && !assignedCharacters.includes(val)) {
                          setAssignedCharacters(prev => [...prev, val]);
                        }
                      }}
                      className={inputStyles.input}
                    >
                      <option value="">Выберите персонажа...</option>
                      {characters
                        .filter(char => !assignedCharacters.includes(char.id))
                        .map(char => (
                          <option key={char.id} value={char.id}>
                            {char.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
        <div className={modalStyles.buttons} style={isMobile ? { flexDirection: 'column' } : undefined}>
          <button type="button" onClick={() => setMode('view')} className={buttonStyles.button} style={isMobile ? { width: '100%' } : undefined}>
            Отмена
          </button>
          <button type="submit" onClick={handleSubmit} className={buttonStyles.button} disabled={loading} style={isMobile ? { width: '100%' } : undefined}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </ModalPortal>
    );
  }

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className={viewStyles.viewHeader}>
        <h2 style={{ margin: 0 }}>{quest.header}</h2>
        <span
          className={viewStyles.viewStatusBadge}
          style={{ backgroundColor: STATUS_COLOR_MAP[quest.status], color: '#fff' }}
        >
          {STATUS_LABEL_MAP[quest.status]}
        </span>
      </div>

      <div className={modalStyles.modalBody}>
        {quest.description && (
          <div className={viewStyles.descriptionBlock}>
            <ReactMarkdown>{quest.description}</ReactMarkdown>
          </div>
        )}

        {quest.objectives && quest.objectives.length > 0 && (
          <div className={viewStyles.objectivesSection}>
            {[...quest.objectives]
              .sort((a, b) => {
                const order: Record<string, number> = {
                  pending: 0,
                  completed: 1,
                  failed: 2,
                  cancelled: 3,
                };
                return (order[a.status] ?? 99) - (order[b.status] ?? 99);
              })
              .map(obj => (
              <div
                key={obj.key}
                className={`${viewStyles.objectiveRow} ${
                  viewStyles[`objectiveStatus_${obj.status}`] || ''
                } ${obj.status !== 'pending' ? viewStyles.objectiveCompact : ''} ${
                  obj.status === 'cancelled' ? viewStyles.objectiveCancelled : ''
                }`}
              >
                <span className={viewStyles.objectiveText}>
                  {obj.description}
                </span>
                <select
                  value={obj.status}
                  onChange={e => onObjectiveStatusChange(quest.id, obj.key, e.target.value as any)}
                  className={`${inputStyles.input} ${viewStyles.objectiveSelect}`}
                >
                  {OBJECTIVE_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {quest.reward && quest.reward.length > 0 && (
          <div className={viewStyles.rewardsSection}>
            {quest.reward.map((item, idx) => (
              <span key={idx} className={viewStyles.rewardTag}>
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          {canEdit && (
            <button
              type="button"
              className={buttonStyles.button}
              style={{ width: '100%' }}
              onClick={() => { if (onEdit) onEdit(); setMode('edit'); }}
            >
              ✏️ Редактировать
            </button>
          )}
          {canDelete && onDelete && (
            <button
              type="button"
              className={buttonStyles.button}
              style={{ width: '100%' }}
              onClick={onDelete}
            >
              🗑️ Удалить
            </button>
          )}
          <button type="button" className={buttonStyles.button} style={{ width: '100%' }} onClick={onClose}>
            ✕ Закрыть
          </button>
        </div>
      ) : (
        <div className={modalStyles.buttons}>
          <div style={{ display: 'flex', gap: '0.5rem', marginRight: 'auto' }}>
            {canEdit && (
              <button
                type="button"
                className={buttonStyles.button}
                onClick={() => { if (onEdit) onEdit(); setMode('edit'); }}
              >
                Редактировать
              </button>
            )}
            {canDelete && onDelete && (
              <button
                type="button"
                className={buttonStyles.button}
                onClick={onDelete}
              >
                Удалить
              </button>
            )}
          </div>
          <button type="button" className={buttonStyles.button} onClick={onClose}>
            Закрыть
          </button>
        </div>
      )}
    </ModalPortal>
  );
};

export default QuestViewModal;
