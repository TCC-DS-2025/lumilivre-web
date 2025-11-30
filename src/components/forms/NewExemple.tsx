import { useState } from 'react';

import {
  cadastrarExemplar,
  type ExemplarPayload,
} from '../../services/exemplarService';
import { useToast } from '../../contexts/ToastContext';

interface NewExemplarProps {
  livroId: number;
  livroIsbn: string;
  livroNome: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoExemplar({
  livroId,
  livroIsbn,
  livroNome,
  onClose,
  onSuccess,
}: NewExemplarProps) {
  const [tombo, setTombo] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tombo.trim() || !localizacao.trim()) {
      addToast({
        type: 'warning',
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
      });
      return;
    }
    setIsLoading(true);

    const payload: ExemplarPayload = {
      livro_id: livroId,
      tombo: tombo,
      status_livro: 'DISPONIVEL',
      localizacao_fisica: localizacao,
    };

    try {
      await cadastrarExemplar(payload);
      addToast({
        type: 'success',
        title: 'Exemplar Cadastrado',
        description: 'O exemplar foi salvo com sucesso!',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao cadastrar exemplar:', error);
      addToast({
        type: 'error',
        title: 'Erro ao cadastrar',
        description:
          error.response?.data?.mensagem ||
          'Erro ao cadastrar exemplar. Verifique se o tombo já existe.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';
  const inputStyles =
    'w-full h-[38px] px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none text-sm';
  const disabledInputStyles =
    'w-full h-[38px] px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none text-sm';
  const buttonClass =
    'w-full bg-lumi-primary hover:bg-lumi-primary-hover active:bg-purple-900 text-white text-[17px] font-bold py-3.5 px-4 border-2 border-transparent rounded-lg shadow-md transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none tracking-wide';

  return (
    <div className="flex flex-col h-full">
      <form
        id="form-novo-exemplar"
        onSubmit={handleSubmit}
        className="overflow-y-auto p-1 flex-grow custom-scrollbar space-y-4"
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
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
          <div className="col-span-8">
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
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              autoFocus
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
        </div>
      </form>

      <div className="pt-3 mt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <button
          type="submit"
          form="form-novo-exemplar"
          disabled={isLoading}
          className={buttonClass}
        >
          {isLoading ? 'CADASTRANDO...' : 'CADASTRAR EXEMPLAR'}
        </button>
      </div>
    </div>
  );
}
