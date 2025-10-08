import { useState } from 'react';
import {
  cadastrarExemplar,
  type ExemplarPayload,
} from '../../services/exemplarService';

interface NewExemplarProps {
  livroIsbn: string;
  livroNome: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoExemplar({
  livroIsbn,
  livroNome,
  onClose,
  onSuccess,
}: NewExemplarProps) {
  const [tombo, setTombo] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tombo.trim() || !localizacao.trim()) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    setIsLoading(true);

    const payload: ExemplarPayload = {
      livro_isbn: livroIsbn,
      tombo: tombo,
      status_livro: 'DISPONIVEL',
      localizacao_fisica: localizacao,
    };

    try {
      await cadastrarExemplar(payload);
      onSuccess(); // Recarrega a lista
      onClose(); // Fecha o modal
    } catch (error: any) {
      console.error('Erro ao cadastrar exemplar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles =
    'w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200';
  const disabledInputStyles =
    'w-full p-2 border-2 border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed';
  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="livroNome" className={labelStyles}>
          Livro
        </label>
        <input
          id="livroNome"
          type="text"
          value={livroNome}
          disabled
          className={disabledInputStyles}
        />
      </div>
      <div>
        <label htmlFor="livroIsbn" className={labelStyles}>
          ISBN
        </label>
        <input
          id="livroIsbn"
          type="text"
          value={livroIsbn}
          disabled
          className={disabledInputStyles}
        />
      </div>
      <div>
        <label htmlFor="tombo" className={labelStyles}>
          Tombo do Exemplar*
        </label>
        <input
          id="tombo"
          type="text"
          value={tombo}
          onChange={(e) => setTombo(e.target.value)}
          required
          className={inputStyles}
          placeholder="Ex: 001234"
        />
      </div>
      <div>
        <label htmlFor="localizacao" className={labelStyles}>
          Localização Física*
        </label>
        <input
          id="localizacao"
          type="text"
          value={localizacao}
          onChange={(e) => setLocalizacao(e.target.value)}
          required
          className={inputStyles}
          placeholder="Ex: Corredor B, Prateleira 2"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md shadow-md transition duration-200 disabled:bg-gray-400"
      >
        {isLoading ? 'Cadastrando...' : 'CADASTRAR'}
      </button>
    </form>
  );
}
