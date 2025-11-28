import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../contexts/AuthContext';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { InputFloatingLabel } from '../../../components/InputFloatingLabel';
import { login as apiLogin } from '../../../services/authService';

import LogoIcon from '../../../assets/icons/logo.svg?react';
import UserIcon from '../../../assets/icons/users.svg?react';
import LockIcon from '../../../assets/icons/lock.svg?react';

export function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

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
        token: responseData.token,
      };

      setAuthUser(userToStore);
      setIsExiting(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      console.error('Erro no login:', err);

      let mensagemErro = 'Usuário ou senha inválidos.';

      if (err.response?.data) {
        if (typeof err.response.data.mensagem === 'string') {
          mensagemErro = err.response.data.mensagem;
        } else if (typeof err.response.data.message === 'string') {
          mensagemErro = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          mensagemErro = err.response.data;
        }
      }

      setError(mensagemErro);
      setIsLoading(false);
    }
  };

  return (
    <main
      className={`
        bg-gray-50 dark:bg-dark-background min-h-screen flex items-center justify-center p-6 relative select-none overflow-hidden
        ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
      `}
    >
      <div className="w-full max-w-sm mx-auto flex flex-col justify-center">
        <div className="text-center mb-5">
          <LogoIcon className="h-[200px] w-auto mx-auto pointer-events-none -mb-1 text-lumi-primary" />
          <h1 className="text-[32px] font-bold text-gray-800 dark:text-gray-100">
            LumiLivre
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputFloatingLabel
            id="usuario"
            type="text"
            label="Email"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            icon={UserIcon}
            disabled={isExiting}
            required
          />

          <InputFloatingLabel
            id="senha"
            type="password"
            label="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            icon={LockIcon}
            disabled={isExiting}
            required
          />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-center text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || isExiting}
              className="w-full bg-lumi-primary hover:bg-lumi-primary-hover active:bg-purple-900 text-white text-[17px] font-bold py-3.5 px-4 border-2 border-transparent rounded-lg shadow-md transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none tracking-wide"
            >
              {isLoading || isExiting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ENTRANDO...
                </span>
              ) : (
                'ENTRAR'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link
            to="/esqueci-a-senha"
            className="text-gray-500 dark:text-gray-400 hover:text-lumi-primary dark:hover:text-lumi-label text-sm font-medium"
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 left-6">
        <ThemeToggle />
      </div>
    </main>
  );
}
