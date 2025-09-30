// GroupUsers.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GroupUser, User } from '../../types/groupUsers';
import { groupUsersAPI } from '../../services/api';
import styles from '../../styles/common.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import UserSearch from '../../components/UsersManagement/UserSearch';
import UsersList from '../../components/UsersManagement/UsersList';
import { useUserManagement } from '../../hooks/useUserManagement';
import CharacterUsersTable from '../../components/UsersManagement/CharacterUsersTable';

const GroupUsers: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
  const { canManageGroupUsers } = useActionPermissions();
  const { loading, error, success, executeOperation } = useUserManagement();

  useEffect(() => {
    if (groupId) {
      loadGroupUsers();
    }
  }, [groupId, loading]);

  const loadGroupUsers = async () => {
    const users = await groupUsersAPI.getGroupUsers(parseInt(groupId!));
    setGroupUsers(users);
  };

  const handleAddUser = async (user: User, isAdmin: boolean) => {
    await executeOperation(
      () => groupUsersAPI.addUserToGroup(parseInt(groupId!), user.id, isAdmin),
      `Пользователь ${user.nickname} успешно добавлен в группу`
    );
  };

  const handleRemoveUser = async (userId: number) => {
    await executeOperation(
      () => groupUsersAPI.removeUserFromGroup(parseInt(groupId!), userId),
      `Пользователь успешно удален из группы`
    );
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1>Управление пользователями группы</h1>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {canManageGroupUsers && (
        <UserSearch
          onSearch={groupUsersAPI.searchUsers}
          onAddUser={handleAddUser}
          permissionOptions={[
            { label: 'Пользователь', value: false },
            { label: 'Администратор', value: true }
          ]}
          title="Добавить пользователя"
        />
      )}

      <div className={styles.section}>
        <h2>Пользователи группы</h2>
        <UsersList
          users={groupUsers.map(gu => ({ user: gu.user, permission: gu.isAdmin }))}
          onRemoveUser={handleRemoveUser}
          formatPermission={(isAdmin) => isAdmin ? '(Администратор)' : ''}
          canManage={canManageGroupUsers}
          emptyMessage="В группе пока нет пользователей"
        />
      </div>

      {/* Секция управления пользователями персонажей (только для админов) */}
      {canManageGroupUsers && groupId && (
        <div className={styles.section}>
          <CharacterUsersTable 
            groupId={parseInt(groupId)} 
            canManage={canManageGroupUsers}
            groupUsers={groupUsers.map(gu => gu.user)}
          />
        </div>
      )}
    </div>
  );
};

export default GroupUsers;