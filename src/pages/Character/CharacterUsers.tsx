import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User } from '../../types/groupUsers';
import { CharacterUser } from '../../types/characterUsers';
import { characterUsersAPI } from '../../services/api';
import { groupUsersAPI } from '../../services/api';
import styles from '../../styles/common.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import { useUserManagement } from '../../hooks/useUserManagement';
import UserSearch from '../../components/UsersManagement/UserSearch';
import UsersList from '../../components/UsersManagement/UsersList';

const CharacterUsers: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const [characterUsers, setCharacterUsers] = useState<CharacterUser[]>([]);
  const { canManageCharacterUsers } = useActionPermissions();
  const { loading, error, success, executeOperation } = useUserManagement();

  useEffect(() => {
    if (groupId && characterId) {
      loadCharacterUsers();
    }
  }, [groupId, characterId]);

  const loadCharacterUsers = async () => {
    const users = await characterUsersAPI.getCharacterUsers(parseInt(groupId!), parseInt(characterId!));
    setCharacterUsers(users);
  };

  const handleAddUser = async (user: User, canWrite: boolean) => {
    await executeOperation(
      () => characterUsersAPI.addUserToCharacter(parseInt(groupId!), parseInt(characterId!), user.id, canWrite),
      `Игрок ${user.nickname} успешно добавлен персонажу`
    );
  };

  const handleRemoveUser = async (userId: number) => {
    await executeOperation(
      () => characterUsersAPI.removeUserFromCharacter(parseInt(groupId!), parseInt(characterId!), userId),
      'Игрок успешно удалён'
    );
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1>Управление игроками персонажа</h1>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      {canManageCharacterUsers && (
        <UserSearch
          onSearch={groupUsersAPI.searchUsers}
          onAddUser={handleAddUser}
          permissionOptions={[
            { label: 'Наблюдатель', value: false },
            { label: 'Игрок', value: true }
          ]}
          title="Добавить пользователя"
        />
      )}
      <div className={styles.section}>
        <h2>Пользователи группы</h2>
        <UsersList
          users={characterUsers.map(cu => ({ user: cu.user, permission: cu.canWrite }))}
          onRemoveUser={handleRemoveUser}
          formatPermission={(canWrite: boolean) => canWrite ? '(Игрок)' : '(Наблюдатель)'}
          canManage={canManageCharacterUsers}
          emptyMessage="В группе пока нет пользователей"
        />
      </div>
    </div>
  );
};

export default CharacterUsers;