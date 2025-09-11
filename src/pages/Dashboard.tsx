import React from 'react';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>Добро пожаловать в приложение!</h1>
      <p>Вы успешно авторизовались и можете пользоваться всеми функциями.</p>
    </div>
  );
};

export default Dashboard;