import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User } from '../types/groupUsers';
import { CharacterUser } from '../types/characterUsers';
import { characterUsersAPI } from '../services/api';
import { groupUsersAPI } from '../services/api';
import buttonStyles from '../styles/components/Button.module.css';
import inputStyles from '../styles/components/Input.module.css';
import styles from './CharacterUsers.module.css';

const CharacterUsers: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const [characterUsers, setCharacterUsers] = useState<CharacterUser[]>([]);
  const [searchNickname, setSearchNickname] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (groupId && characterId) {
      loadCharacterUsers();
    }
  }, [groupId, characterId]);

  const loadCharacterUsers = async () => {
    try {
      setLoading(true);
      const users = await characterUsersAPI.getCharacterUsers(parseInt(groupId!), parseInt(characterId!));
      setCharacterUsers(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character users');
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

  const handleAddUser = async (user: User, canWrite: boolean) => {
    try {
      await characterUsersAPI.addUserToCharacter(parseInt(groupId!), parseInt(characterId!), user.id, canWrite);
      setSuccess(`Пользователь ${user.nickname} успешно добавлен к персонажу`);
      setSearchResults([]);
      setSearchNickname('');
      loadCharacterUsers(); // Перезагружаем список пользователей персонажа
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user to character');
    }
  };

  const handleRemoveUser = async (userId: number) => {
    try {
      await characterUsersAPI.removeUserFromCharacter(parseInt(groupId!), parseInt(characterId!), userId);
      setSuccess('Пользователь успешно удален из персонажа');
      loadCharacterUsers(); // Перезагружаем список пользователей персонажа
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user from character');
    }
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1>Управление игроками персонажа</h1>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.section}>
        <h2>Добавить игрока</h2>
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
                    Добавить (чтение)
                  </button>
                  <button onClick={() => handleAddUser(user, true)} className={buttonStyles.button}>
                    Добавить (редактирование)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Игроки персонажа</h2>
        {characterUsers.length === 0 ? (
          <p>К персонажу пока не добавлены игроки</p>
        ) : (
          <div className={styles.usersList}>
            {characterUsers.map(characterUser => (
              <div key={characterUser.user.id} className={styles.userCard}>
                <img src={characterUser.user.imageLink || '/default-avatar.png'} alt={characterUser.user.nickname} className={styles.avatar} />
                <div className={styles.userInfo}>
                  <h4>{characterUser.user.visibleName}</h4>
                  <p>@{characterUser.user.nickname} {characterUser.canWrite ? '(Редактор)' : '(Читатель)'}</p>
                </div>
                <div className={styles.actions}>
                  <button 
                    onClick={() => handleRemoveUser(characterUser.user.id)} 
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

export default CharacterUsers;