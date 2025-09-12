import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GroupUser, User } from '../../types/groupUsers';
import { groupUsersAPI } from '../../services/api';
import buttonStyles from '../../styles/components/Button.module.css';
import inputStyles from '../../styles/components/Input.module.css';
import styles from './GroupUsers.module.css';

const GroupUsers: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
  const [searchNickname, setSearchNickname] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      loadGroupUsers();
    }
  }, [groupId]);

  const loadGroupUsers = async () => {
    try {
      setLoading(true);
      const users = await groupUsersAPI.getGroupUsers(parseInt(groupId!));
      setGroupUsers(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchNickname.trim()) return;

    try {
      setLoading(true);
      const users = await groupUsersAPI.searchUsers(searchNickname);
      setSearchResults(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user: User, isAdmin: boolean) => {
    try {
      await groupUsersAPI.addUserToGroup(parseInt(groupId!), user.id, isAdmin);
      setSuccess(`Пользователь ${user.nickname} успешно добавлен в группу`);
      setSearchResults([]);
      setSearchNickname('');
      loadGroupUsers(); // Перезагружаем список пользователей группы
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user to group');
    }
  };

  const handleRemoveUser = async (userId: number) => {
    try {
      await groupUsersAPI.removeUserFromGroup(parseInt(groupId!), userId);
      setSuccess('Пользователь успешно удален из группы');
      loadGroupUsers(); // Перезагружаем список пользователей группы
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user from group');
    }
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1>Управление пользователями группы</h1>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.section}>
        <h2>Добавить пользователя</h2>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Введите никнейм пользователя"
            value={searchNickname}
            onChange={(e) => setSearchNickname(e.target.value)}
            className={inputStyles.input}
          />
          <button onClick={handleSearch} className={buttonStyles.button}>
            Поиск
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className={styles.searchResults}>
            <h3>Результаты поиска:</h3>
            {searchResults.map(user => (
              <div key={user.id} className={styles.userCard}>
                <img src={user.imageLink || '/default-avatar.png'} alt={user.nickname} className={styles.avatar} />
                <div className={styles.userInfo}>
                  <h4>{user.visibleName}</h4>
                  <p>@{user.nickname}</p>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => handleAddUser(user, false)} className={buttonStyles.button}>
                    Добавить
                  </button>
                  <button onClick={() => handleAddUser(user, true)} className={buttonStyles.button}>
                    Добавить как администратора
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Пользователи группы</h2>
        {groupUsers.length === 0 ? (
          <p>В группе пока нет пользователей</p>
        ) : (
          <div className={styles.usersList}>
            {groupUsers.map(groupUser => (
              <div key={groupUser.user.id} className={styles.userCard}>
                <img src={groupUser.user.imageLink || '/default-avatar.png'} alt={groupUser.user.nickname} className={styles.avatar} />
                <div className={styles.userInfo}>
                  <h4>{groupUser.user.visibleName}</h4>
                  <p>@{groupUser.user.nickname} {groupUser.isAdmin && '(Администратор)'}</p>
                </div>
                <div className={styles.actions}>
                  <button 
                    onClick={() => handleRemoveUser(groupUser.user.id)} 
                    className={buttonStyles.button}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupUsers;