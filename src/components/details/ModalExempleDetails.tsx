import { useState, useEffect } from 'react';

import { Modal } from '../Modal';
import { type ListaLivro } from '../../services/livroService';
import {
  atualizarExemplar,
  excluirExemplar,
} from '../../services/exemplarService';

interface ModalExemplarDetailsProps {
  exemplar: ListaLivro | null;
  isOpen: boolean;
  onClose: (foiAtualizado?: boolean) => void;
}

export function ModalExemplarDetails({
  exemplar,
  isOpen,
  onClose,
}: ModalExemplarDetailsProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do formulário
  const [tombo, setTombo] = useState('');
  const [localizacao, setLocalizacao] = useState('');

  // Carrega os dados quando o modal abre ou o exemplar muda
  useEffect(() => {
    if (exemplar && isOpen) {
      setTombo(exemplar.tomboExemplar);
      setLocalizacao(exemplar.localizacao_fisica);
      setIsEditMode(false);
    }
  }, [exemplar, isOpen]);

  if (!isOpen || !exemplar) return null;

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const handleAlterarClick = () => setIsEditMode(true);

  const handleSalvar = async () => {
    if (!tombo.trim() || !localizacao.trim()) {
      alert('Preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      await atualizarExemplar(exemplar.tomboExemplar, {
        tombo: tombo,
        localizacao_fisica: localizacao,
      });

      alert('Exemplar atualizado com sucesso!');
      setIsEditMode(false);
      onClose(true);
    } catch (error: any) {
      console.error('Erro ao atualizar exemplar:', error);
      alert(error.response?.data?.mensagem || 'Erro ao atualizar exemplar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluir = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o exemplar de tombo "${exemplar.tomboExemplar}"?`,
      )
    ) {
      setIsLoading(true);
      try {
        await excluirExemplar(exemplar.tomboExemplar);
        alert('Exemplar excluído com sucesso!');
        onClose(true);
      } catch (error: any) {
        alert(
          `Erro ao excluir: ${error.response?.data?.mensagem || 'Erro desconhecido'}`,
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1 flex justify-between items-center';
  const inputStyles =
    'w-full h-[38px] px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none text-sm';
  const disabledInputStyles =
    'w-full h-[38px] px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none text-sm flex items-center';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Editar Exemplar' : 'Detalhes do Exemplar'}
    >
      <div className="flex flex-col h-full">
        {exemplar.status !== 'DISPONIVEL' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 mb-4 rounded-md border border-yellow-100 dark:border-yellow-800/30">
            <label className="block text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase mb-1">
              Emprestado para
            </label>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {exemplar.responsavel || '-'}
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tombo" className={labelStyles}>
                Tombo
              </label>
              <input
                id="tombo"
                type="text"
                value={tombo}
                onChange={(e) => setTombo(e.target.value)}
                disabled={!isEditMode}
                className={isEditMode ? inputStyles : disabledInputStyles}
              />
            </div>

            <div>
              <label htmlFor="localizacao" className={labelStyles}>
                Localização Física
              </label>
              <input
                id="localizacao"
                type="text"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                disabled={!isEditMode}
                className={isEditMode ? inputStyles : disabledInputStyles}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleExcluir}
            disabled={isLoading || isEditMode}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            Excluir
          </button>

          {isEditMode ? (
            <button
              onClick={handleSalvar}
              disabled={isLoading}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 shadow-md"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          ) : (
            <button
              onClick={handleAlterarClick}
              className="bg-lumi-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-lumi-primary-hover shadow-md"
            >
              Editar Cadastro
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
