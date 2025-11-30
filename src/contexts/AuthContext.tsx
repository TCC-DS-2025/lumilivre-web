import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
  useCallback,
} from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';

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
  const { addToast } = useToast();

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const carregarUsuarioStorage = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);

          if (parsedUser.token) {
            setUser(parsedUser);
            api.defaults.headers.common['Authorization'] =
              `Bearer ${parsedUser.token}`;
          } else {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Falha ao carregar dados do usuário', error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    carregarUsuarioStorage();
  }, []);

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          (error.response?.status === 403 || error.response?.status === 401) &&
          user
        ) {
          console.warn('Sessão expirada ou inválida. Realizando logout...');

          addToast({
            type: 'info',
            title: 'Sessão Expirada',
            description: 'Por favor, faça login novamente para continuar.',
          });

          logout();
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [user, logout, addToast]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const logoutWithAnimation = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
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
