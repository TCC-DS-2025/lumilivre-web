import { useState } from 'react';
import { Link } from 'react-router-dom';

import { requestPasswordReset } from '../../../services/authService';
import { InputFloatingLabel } from '../../../components/InputFloatingLabel';
import { ThemeToggle } from '../../../components/ThemeToggle';

import LogoIcon from '../../../assets/icons/logo.svg?react';
import UserIcon from '../../../assets/icons/users.svg?react';

export function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!email.includes('@')) {
      setError('Por favor, insira um e-mail válido.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await requestPasswordReset(email);
      setSuccessMessage(data.mensagem);
    } catch (err: any) {
      setError(
        err.response?.data?.mensagem ||
          'Ocorreu um erro ao processar sua solicitação.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-gray-50 dark:bg-dark-background min-h-screen flex items-center justify-center p-6 relative select-none overflow-hidden">
      <div className="w-full max-w-sm mx-auto flex flex-col justify-center">
        <div className="text-center mb-5">
          <LogoIcon className="h-[200px] w-auto mx-auto pointer-events-none -mb-1 text-lumi-primary" />
          <h1 className="text-[32px] font-bold text-gray-800 dark:text-gray-100">
            Esqueci a Senha
          </h1>
        </div>

        {successMessage ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md text-center mb-6">
            <p className="font-bold">Solicitação Enviada!</p>
            <p className="text-sm">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputFloatingLabel
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={UserIcon}
              required
            />

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-center text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-lumi-primary hover:bg-lumi-primary-hover active:bg-purple-900 text-white text-[17px] font-bold py-3.5 px-4 border-2 border-transparent rounded-lg shadow-md transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none tracking-wide"
              >
                {isLoading ? 'ENVIANDO...' : 'ENVIAR LINK'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-gray-500 dark:text-gray-400 hover:text-lumi-primary dark:hover:text-lumi-label text-sm font-medium"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 left-6">
        <ThemeToggle />
      </div>
    </main>
  );
}
