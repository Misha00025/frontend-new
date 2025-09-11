import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const AppContent: React.FC = () => {
  const { accessToken } = useAuth();
  return accessToken ? <Dashboard /> : <Login />;
};

const App: React.FC = () => {
  return (
  <ThemeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
  );
};

export default App;