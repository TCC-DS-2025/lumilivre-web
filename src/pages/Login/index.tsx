import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { login as apiLogin } from '../../services/authService'; 

import Logo from '../../assets/images/logo.png';

export function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate(); 
  const { login: setAuthUser } = useAuth(); // salva o estado globalmente

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const responseData = await apiLogin({ user: usuario, senha: senha });
      
      const userToStore = {
        id: responseData.id,
        email: responseData.email,
        role: responseData.role,
        token: responseData.token
      };
      
      setAuthUser(userToStore);
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Usuário ou senha inválidos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4 relative">
      
      <div className="w-full max-w-sm mx-auto">
        
        <div className="text-center mb-5">
          <img 
            src={Logo} 
            alt="Lumi Livre Logo" 
            className="w-48 h-48 mx-auto"
          />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            LumiLivre
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          
          <div>
            <label 
              htmlFor="usuario" 
              className="block text-sm font-medium text-lumi-primary mb-1 pl-3"
            >
              Usuário
            </label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Digite o seu usuário"
              className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition duration-200"
              required
            />
          </div>

          <div>
            <label 
              htmlFor="senha" 
              className="block text-sm font-medium text-lumi-primary mb-1 pl-3"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha aqui"
              className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition duration-200"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-center">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-lumi-primary hover:bg-lumi-primary-hover text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'ENTRAR'}
            </button>
          </div>

        </form>

        <div className="text-center mt-3">
          <Link to="/esqueci-a-senha" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline">
            Esqueceu sua senha?
          </Link>
        </div>
        
      </div>

      <div className="absolute bottom-5 left-5">
        <ThemeToggle />
      </div>
    </main>
  );
}