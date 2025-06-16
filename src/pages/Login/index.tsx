import { useState } from 'react';
import Logo from '../../assets/images/logo.png';

export function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Tentativa de login com:', { usuario, senha });
  };

  return (
    <main className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      
      <div className="w-full max-w-sm mx-auto">
        
        <div className="text-center mb-5">
          <img 
            src={Logo} 
            alt="Lumi Livre Logo" 
            className="w-48 h-48 mx-auto"
          />
          <h1 className="text-3xl font-bold text-gray-800">
            LUMI LIVRE
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
              className="w-full p-3 bg-white border-2 border-gray-400 rounded-md text-gray-800 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition duration-200"
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
              className="w-full p-3 bg-white border-2 border-gray-400 rounded-md text-gray-800 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition duration-200"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="mt-2 w-full bg-lumi-primary hover:bg-lumi-primary-hover text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary"
            >
              ENTRAR
            </button>
          </div>

        </form>

        <div className="text-center mt-3">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
            Esqueceu sua senha?
          </a>
        </div>
        
      </div>
    </main>
  );
}