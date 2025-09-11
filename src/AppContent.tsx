
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { accessToken } = useAuth();
  return accessToken ? <Dashboard /> : <Login />;
};

export default AppContent