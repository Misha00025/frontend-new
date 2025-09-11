import React, { useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import styles from './Profile.module.css';

const Profile: React.FC = () => {
  const { profile, loading, error, fetchProfile } = useProfile();

  useEffect(() => {
    fetchProfile();
  }, []); // Убрали fetchProfile из зависимостей

  if (loading) return <div className={styles.container}>Загрузка...</div>;
  if (error) return <div className={styles.container}>Ошибка: {error}</div>;

  return (
    <div className={styles.container}>
      <h1>Профиль пользователя</h1>
      {profile && (
        <div className={styles.profile}>
          {profile.imageLink && (
            <img 
              src={profile.imageLink} 
              alt="Аватар" 
              className={styles.avatar}
            />
          )}
          <div className={styles.info}>
            <p><strong>ID:</strong> {profile.id}</p>
            <p><strong>Никнейм:</strong> {profile.nickname}</p>
            <p><strong>Видимое имя:</strong> {profile.visibleName}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;