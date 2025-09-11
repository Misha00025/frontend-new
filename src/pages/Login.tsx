import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import buttonStyles from '../styles/components/Button.module.css';
import inputStyles from '../styles/components/Input.module.css';
import '../styles/globals.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <div>
      <ThemeToggle />
      <form className="form" onSubmit={handleSubmit}>
        <input
          className={inputStyles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className={inputStyles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className={buttonStyles.button} type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;