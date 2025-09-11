import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import buttonStyles from '../styles/components/Button.module.css';
import inputStyles from '../styles/components/Input.module.css';
import commonStyles from '../styles/common.module.css';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }
        await register(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRegistering ? 'Registration failed' : 'Login failed'));
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <ThemeToggle />
      </div>
      
      <form className={commonStyles.form} onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {isRegistering ? 'Регистрация' : 'Вход в систему'}
        </h2>
        
        {error && <div className={commonStyles.error}>{error}</div>}

        <input
          className={inputStyles.input}
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className={inputStyles.input}
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {isRegistering && (
          <input
            className={inputStyles.input}
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        )}

        <button className={buttonStyles.button} type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : (isRegistering ? 'Зарегистрироваться' : 'Войти')}
        </button>

        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', marginTop: '1rem' }}
        >
          {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default Login;