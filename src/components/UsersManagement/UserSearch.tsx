import React, { useState } from 'react';
import { User } from '../../types/groupUsers';
import buttonStyles from '../../styles/components/Button.module.css';
import inputStyles from '../../styles/components/Input.module.css';
import styles from '../../styles/common.module.css';
import stylesUi from '../../styles/ui.module.css';

interface UserSearchProps {
  onSearch: (nickname: string) => Promise<User[]>;
  onAddUser: (user: User, permission: any) => Promise<void>;
  permissionOptions: {
    label: string;
    value: any;
  }[];
  title: string;
}

const UserSearch: React.FC<UserSearchProps> = ({
  onSearch,
  onAddUser,
  permissionOptions,
  title
}) => {
  const [searchNickname, setSearchNickname] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchNickname.trim()) return;
    
    setLoading(true);
    try {
      const users = await onSearch(searchNickname);
      setSearchResults(users);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2>{title}</h2>
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
        <div className={stylesUi.searchResults}>
          <h3>Результаты поиска:</h3>
          {searchResults.map(user => (
            <div key={user.id} className={stylesUi.userCard}>
              <img src={user.imageLink || '/default-avatar.png'} alt={user.nickname} className={stylesUi.avatar} />
              <div className={stylesUi.userInfo}>
                <h4>{user.visibleName}</h4>
                <p>@{user.nickname}</p>
              </div>
              <div className={stylesUi.actions}>
                {permissionOptions.map(option => (
                  <button
                    key={option.label}
                    onClick={() => onAddUser(user, option.value)}
                    className={buttonStyles.button}
                  >
                    Добавить ({option.label})
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;