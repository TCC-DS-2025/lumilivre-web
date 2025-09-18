import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Logo from '../../assets/images/logo.png';
import { validarTokenReset, mudarSenhaComToken } from '../../services/authService';

export function MudarSenhaPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [token, setToken] = useState<string | null>(null);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // validação do token
    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            setError("Token não encontrado na URL.");
            setIsLoading(false);
            return;
        }
        setToken(tokenFromUrl);

        const verificarToken = async () => {
            try {
                const isValid = await validarTokenReset(tokenFromUrl);
                if (isValid) {
                    setIsTokenValid(true);
                } else {
                    setError("Ocorreu um erro: Token inválido ou expirado. Por favor, solicite um novo link.");
                }
            } catch {
                setError("Ocorreu um erro ao validar o token.");
            } finally {
                setIsLoading(false);
            }
        };
        verificarToken();
    }, [searchParams]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (novaSenha.length < 6) { 
            setError("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (novaSenha !== confirmarSenha) {
            setError("As senhas não coincidem.");
            return;
        }
        if (!token) {
            setError("Token inválido.");
            return;
        }
        
        setIsLoading(true);
        try {
            await mudarSenhaComToken(token, novaSenha);
            setSuccessMessage("Senha alterada com sucesso! Você será redirecionado para a página de login em 5 segundos.");
            setTimeout(() => navigate('/login'), 5000);
        } catch (err: any) {
            setError(err.response?.data?.mensagem || "Não foi possível alterar a senha. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-center">Validando seu link...</p>;
        }
        if (!isTokenValid) {
            return (
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Link to="/esqueci-a-senha" className="text-lumi-primary hover:underline">Solicitar um novo link</Link>
                </div>
            );
        }
        if (successMessage) {
            return <p className="text-center text-green-600">{successMessage}</p>;
        }
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="novaSenha" className="block text-sm font-medium text-lumi-label mb-1 pl-3">Nova Senha</label>
                <input 
                    id="novaSenha" 
                    type="password" 
                    value={novaSenha} 
                    onChange={e => setNovaSenha(e.target.value)} 
                    placeholder="Digite uma nova senha"
                    required 
                    className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 shadow-md rounded-md text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200 transform hover:scale-105 hover:bg-gray-300 dark:hover:bg-gray-600"
                    />
            </div>
            <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-medium text-lumi-label mb-1 pl-3">Confirmar Senha</label>
                <input 
                    id="confirmarSenha" 
                    type="password" 
                    value={confirmarSenha} 
                    onChange={e => setConfirmarSenha(e.target.value)} 
                    placeholder="Digite novamente a senha"
                    required 
                    className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 shadow-md rounded-md text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200 transform hover:scale-105 hover:bg-gray-300 dark:hover:bg-gray-600"
                />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-lumi-primary hover:bg-lumi-primary-hover text-white font-bold py-3 px-4 shadow-md rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Salvando...' : 'SALVAR'}
                </button>
            </div>
        </form>
        );
    };

    return (
        <main className="bg-gray-100 dark:bg-dark-background min-h-screen flex items-center justify-center p-4 select-none">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center">
                    <img src={Logo} alt="LumiLivre Logo" className="w-48 h-48 mx-auto pointer-events-none" />
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Redefinir Senha</h2>
                    {renderContent()}
                </div>
            </div>
        </main>
    );
}