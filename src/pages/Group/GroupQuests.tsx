import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GroupQuest, PatchGroupQuestRequest } from '../../types/groupQuests';
import { groupQuestsAPI, charactersAPI, groupUsersAPI, characterUsersAPI } from '../../services/api';
import { User } from '../../types/groupUsers';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import List from '../../components/List/List';
import SearchBar from '../../components/commons/Search/SearchBar';
import QuestCard from './Cards/QuestCard/QuestCard';
import QuestViewModal from './Modals/QuestModal/QuestViewModal';
import commonStyles from '../../styles/common.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import styles from '../../components/commons/Pages/ResourcePage/ResourcePage.module.css';

const GroupQuests: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [quests, setQuests] = useState<GroupQuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingQuest, setViewingQuest] = useState<GroupQuest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [characters, setCharacters] = useState<Array<{ id: number; name: string }>>([]);
  const [groupUsersMap, setGroupUsersMap] = useState<Map<number, User>>(new Map());
  const [charUserMap, setCharUserMap] = useState<Map<number, number[]>>(new Map());
  const { canCreateQuests, canEditQuests, canDeleteQuests } = useActionPermissions();

  useEffect(() => {
    if (groupId) {
      loadQuests();
      loadCharacters();
    }
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadQuests = async () => {
    try {
      setLoading(true);
      const questsData = await groupQuestsAPI.getQuests(parseInt(groupId!));
      setQuests(questsData);
      loadUserInfo(questsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  const loadCharacters = async () => {
    try {
      const chars = await charactersAPI.getCharacters(parseInt(groupId!));
      setCharacters(chars.filter(c => c.name !== null).map(c => ({ id: c.id, name: c.name! })));
    } catch (err) {
      console.error('Failed to load characters for quest modal:', err);
    }
  };

  const loadUserInfo = async (questsData: GroupQuest[]) => {
    try {
      const groupUsers = await groupUsersAPI.getGroupUsers(parseInt(groupId!));
      const userMap = new Map(groupUsers.map(gu => [gu.user.id, gu.user]));
      setGroupUsersMap(userMap);

      const allCharIds = Array.from(new Set(questsData.flatMap(q => q.assignedCharacters)));
      if (allCharIds.length === 0) {
        return;
      }

      const charMap = new Map<number, number[]>();
      await Promise.all(allCharIds.map(async (charId) => {
        try {
          const users = await characterUsersAPI.getCharacterUsers(parseInt(groupId!), charId);
          charMap.set(charId, users.map(u => u.user.id));
        } catch (err) {
          console.error(`Failed to load users for character ${charId}:`, err);
        }
      }));

      setCharUserMap(charMap);
    } catch (err) {
      console.error('Failed to load user info:', err);
    }
  };

  const getQuestUsers = (quest: GroupQuest): User[] => {
    const userIds = new Set<number>();
    quest.assignedCharacters.forEach(charId => {
      const userIdsForChar = charUserMap.get(charId) || [];
      userIdsForChar.forEach(uid => userIds.add(uid));
    });
    return Array.from(userIds)
      .map(uid => groupUsersMap.get(uid))
      .filter((u): u is User => u !== undefined);
  };

  const filteredQuests = quests.filter(quest => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      quest.header.toLowerCase().includes(term) ||
      quest.description.toLowerCase().includes(term) ||
      quest.reward.some(r => r.toLowerCase().includes(term))
    );
  });

  const handleView = (quest: GroupQuest) => {
    setViewingQuest(quest);
    setIsViewModalOpen(true);
  };

  const handleCreate = () => {
    setViewingQuest(null);
    setIsViewModalOpen(true);
  };

  const handleSaveQuest = async (data: PatchGroupQuestRequest) => {
    if (viewingQuest) {
      await groupQuestsAPI.updateQuest(parseInt(groupId!), viewingQuest.id, data);
    } else {
      await groupQuestsAPI.createQuest(parseInt(groupId!), {
        header: data.header!,
        description: data.description,
        reward: data.reward,
        status: data.status,
        objectives: data.objectives,
        assignedCharacters: data.assignedCharacters,
      });
    }
    setIsViewModalOpen(false);
    setViewingQuest(null);
    loadQuests();
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.headerButtons}>
          {canCreateQuests && (
            <button className={`${buttonStyles.button} ${styles.createButton}`} onClick={handleCreate} type="button">
              <span className={styles.plusIcon}>+</span>
              <span className={styles.createText}>Создать</span>
            </button>
          )}
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</div>}

      <div className={styles.headerControls}>
        <div className={styles.searchContainer}>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Поиск по названию, описанию или награде..."
            onClear={() => setSearchTerm('')}
          />
        </div>
      </div>

      <List layout="start-grid" gap="medium" gridSize="large">
        {filteredQuests.map(quest => (
          <QuestCard
            key={quest.id}
            quest={quest}
            users={getQuestUsers(quest)}
            onView={() => handleView(quest)}
          />
        ))}
      </List>

      {filteredQuests.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>{searchTerm ? `По запросу "${searchTerm}" ничего не найдено` : 'Нет квестов'}</p>
          {searchTerm && (
            <button className={buttonStyles.button} onClick={() => setSearchTerm('')} type="button">
              Очистить поиск
            </button>
          )}
        </div>
      )}

      {isViewModalOpen && (
        <QuestViewModal
          quest={viewingQuest}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingQuest(null);
          }}
          onSave={handleSaveQuest}
          onObjectiveStatusChange={async (questId, objectiveKey, newStatus) => {
            const quest = quests.find(q => q.id === questId);
            if (!quest) return;

            const updatedObjectives = quest.objectives.map(obj =>
              obj.key === objectiveKey ? { ...obj, status: newStatus } : obj
            );

            await groupQuestsAPI.patchQuest(parseInt(groupId!), questId, {
              objectives: updatedObjectives,
            });

            // Обновляем состояние локально, без перезагрузки
            const updatedQuest = { ...quest, objectives: updatedObjectives };
            setQuests(prev => prev.map(q => q.id === questId ? updatedQuest : q));
            setViewingQuest(updatedQuest);
          }}
          onDelete={canDeleteQuests ? async () => {
            if (!viewingQuest) return;
            if (!window.confirm('Вы уверены, что хотите удалить этот квест?')) return;
            try {
              await groupQuestsAPI.deleteQuest(parseInt(groupId!), viewingQuest.id);
              setIsViewModalOpen(false);
              setViewingQuest(null);
              loadQuests();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to delete quest');
            }
          } : undefined}
          canEdit={canEditQuests}
          canDelete={canDeleteQuests}
          characters={characters}
        />
      )}
    </div>
  );
};

export default GroupQuests;
