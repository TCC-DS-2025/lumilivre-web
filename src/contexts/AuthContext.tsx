import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (userData: User) => void;
  logout: () => void;
  logoutWithAnimation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);

        api.defaults.headers.common['Authorization'] =
          `Bearer ${parsedUser.token}`;
      }
    } catch (error) {
      console.error('Falha ao carregar dados do usuário', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');

    delete api.defaults.headers.common['Authorization'];
  };

  const logoutWithAnimation = () => {
    setIsLoggingOut(true);

    setTimeout(() => {
      logout();
      navigate('/login');
      setIsLoggingOut(false);
    }, 300);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        isLoggingOut,
        login,
        logout,
        logoutWithAnimation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
