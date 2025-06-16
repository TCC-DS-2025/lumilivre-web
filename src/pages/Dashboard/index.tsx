import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../contexts/AuthContext';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); 

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-xl">
        Bem-vindo, <span className="font-bold text-lumi-primary">{user?.nome || 'Usuário'}</span>!
      </p>
      <button
        onClick={handleLogout} 
        className="mt-8 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        Sair (Logout)
      </button>
    </div>
  );
}