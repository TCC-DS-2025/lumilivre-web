import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

import {
  validarTokenReset,
  mudarSenhaComToken,
} from '../../../services/authService';
import { InputFloatingLabel } from '../../../components/InputFloatingLabel';
import { ThemeToggle } from '../../../components/ThemeToggle';

import LogoIcon from '../../../assets/icons/logo.svg?react';
import LockIcon from '../../../assets/icons/lock.svg?react';

export function MudarSenhaPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Token não encontrado na URL.');
      setIsLoadingToken(false);
      return;
    }
    setToken(tokenFromUrl);

    const verificarToken = async () => {
      try {
        const isValid = await validarTokenReset(tokenFromUrl);
        if (isValid) {
          setIsTokenValid(true);
        } else {
          setError(
            'Este link é inválido ou expirou. Por favor, solicite uma nova redefinição.',
          );
        }
      } catch {
        setError('Ocorreu um erro ao validar o token de segurança.');
      } finally {
        setIsLoadingToken(false);
      }
    };
    verificarToken();
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!token) {
      setError('Token inválido.');
      return;
    }

    setIsSubmitting(true);
    try {
      await mudarSenhaComToken(token, novaSenha);
      setSuccessMessage(
        'Senha alterada com sucesso! Redirecionando para o login...',
      );
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.mensagem ||
          'Não foi possível alterar a senha. Tente novamente.',
      );
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isLoadingToken) {
      return (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-lumi-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Validando seu link de segurança...</p>
        </div>
      );
    }

    if (!isTokenValid) {
      return (
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm mb-6">
            {error}
          </div>
          <Link
            to="/esqueci-a-senha"
            className="text-lumi-primary hover:underline font-bold"
          >
            Solicitar um novo link
          </Link>
        </div>
      );
    }

    if (successMessage) {
      return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md text-center">
          <p className="font-bold text-lg mb-1">Tudo certo!</p>
          <p className="text-sm">{successMessage}</p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputFloatingLabel
          id="novaSenha"
          type="password"
          label="Nova Senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          icon={LockIcon}
          required
        />

        <InputFloatingLabel
          id="confirmarSenha"
          type="password"
          label="Confirmar Senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          icon={LockIcon}
          required
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-center text-sm animate-fade-in">
            {error}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-lumi-primary hover:bg-lumi-primary-hover active:bg-purple-900 text-white text-[17px] font-bold py-3.5 px-4 border-2 border-transparent rounded-lg shadow-md transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none tracking-wide"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                SALVANDO...
              </span>
            ) : (
              'REDEFINIR'
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <main className="bg-gray-50 dark:bg-dark-background min-h-screen flex items-center justify-center p-6 relative select-none overflow-hidden">
      <div className="w-full max-w-sm mx-auto flex flex-col justify-center">
        <div className="text-center mb-5">
          <LogoIcon className="h-[200px] w-auto mx-auto pointer-events-none -mb-1 text-lumi-primary" />
          <h1 className="text-[32px] font-bold text-gray-800 dark:text-gray-100">
            Redefinir a Senha
          </h1>
        </div>

        {renderContent()}

        {!isLoadingToken && !successMessage && (
          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-gray-500 dark:text-gray-400 hover:text-lumi-primary dark:hover:text-lumi-label text-sm font-medium"
            >
              Cancelar e Voltar ao Login
            </Link>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-6">
        <ThemeToggle />
      </div>
    </main>
  );
}