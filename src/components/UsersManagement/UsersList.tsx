import React from 'react';
import { User } from '../../types/groupUsers';
import buttonStyles from '../../styles/components/Button.module.css';
import stylesUi from '../../styles/ui.module.css';

interface UsersListProps {
  users: {
    user: User;
    permission: any;
  }[];
  onRemoveUser: (userId: number) => void;
  formatPermission: (permission: any) => string;
  canManage: boolean;
  emptyMessage: string;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  onRemoveUser,
  formatPermission,
  canManage,
  emptyMessage
}) => {
  if (users.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div className={stylesUi.usersList}>
      {users.map(item => (
        <div key={item.user.id} className={stylesUi.userCard}>
          <img src={item.user.imageLink || '/default-avatar.png'} alt={item.user.nickname} className={stylesUi.avatar} />
          <div className={stylesUi.userInfo}>
            <h4>{item.user.visibleName}</h4>
            <p>@{item.user.nickname} {formatPermission(item.permission)}</p>
          </div>
          {canManage && (
            <div className={stylesUi.actions}>
              <button 
                onClick={() => onRemoveUser(item.user.id)} 
                className={buttonStyles.button}
              >
                Удалить
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UsersList;