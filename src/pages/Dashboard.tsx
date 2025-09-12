import React from 'react';
import styles from '../styles/common.module.css';

const Dashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>Добро пожаловать в приложение!</h1>
      <p>Выберите группу из меню "Группы" чтобы начать работу.</p>
    </div>
  );
};

export default Dashboard;