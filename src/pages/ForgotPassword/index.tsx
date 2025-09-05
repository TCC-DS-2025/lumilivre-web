import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/images/logo.png';
import { requestPasswordReset } from '../../services/authService';

export function ForgotPasswordPage() {
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
      setError(err.response?.data?.mensagem || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-5">
          <img src={Logo} alt="Lumi Livre Logo" className="w-48 h-48 mx-auto" />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">Recuperar Senha</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            Digite seu e-mail, caso esteja cadastrado, receberá um link para redefir sua senha.
          </p>

          {successMessage ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md text-center">
              <p className="font-bold">Solicitação Enviada!</p>
              <p className="text-sm">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-lumi-primary mb-1 pl-3">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full p-3 bg-white dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition duration-200"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-center text-sm">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-lumi-primary hover:bg-lumi-primary-hover text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enviando...' : 'ENVIAR LINK'}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <Link to="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline">
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}