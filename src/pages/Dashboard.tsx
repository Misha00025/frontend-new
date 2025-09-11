import React from 'react';
import { useGroup } from '../contexts/GroupContext';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { selectedGroup } = useGroup();

  return (
    <div className={styles.container}>
      {selectedGroup ? (
        <div>
          <div className={styles.groupHeader}>
            {selectedGroup.icon && (
              <img src={selectedGroup.icon} alt={selectedGroup.name} className={styles.groupIconLarge} />
            )}
            <h1>{selectedGroup.name}</h1>
          </div>
          <div className={styles.groupInfo}>
            <p>Здесь будет информация о группе, список участников и другие детали.</p>
            {/* В будущем здесь можно добавить больше информации о группе */}
          </div>
        </div>
      ) : (
        <div>
          <h1>Добро пожаловать в приложение!</h1>
          <p>Выберите группу из меню "Группы" чтобы начать работу.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;