import React from 'react';
import { useAuth } from '../hooks/useAuth';
import buttonStyles from '../styles/components/Button.module.css';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Добро пожаловать в приложение!</h1>
      <p>Вы успешно авторизовались и можете пользоваться всеми функциями.</p>
      <button className={buttonStyles.button} onClick={logout} style={{ marginTop: '1rem' }}>
        Выйти
      </button>
    </div>
  );
};

export default Dashboard;