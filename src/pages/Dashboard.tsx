import React from 'react';
import GlobalSidebar from '../components/commons/GlobalSidebar/GlobalSidebar';
import styles from '../styles/common.module.css';

const Dashboard: React.FC = () => {
  return (
    <div style={{ paddingTop: '60px' }}>
      <GlobalSidebar />
      <div className={styles.container}>
        <h1>Добро пожаловать в приложение!</h1>
        <p>Выберите группу из меню "Группы" чтобы начать работу.</p>
      </div>
    </div>
  );
};

export default Dashboard;