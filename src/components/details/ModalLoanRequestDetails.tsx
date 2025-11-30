import { useState, useEffect } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../Modal';
import { SearchableSelect } from '../SearchableSelect';
import {
  processarSolicitacao,
  type SolicitacaoPendente,
} from '../../services/solicitacaoEmprestimoService';

import { buscarLivrosAgrupados } from '../../services/livroService';
import { buscarExemplaresPorLivroId } from '../../services/exemplarService';

interface ModalLoanRequestDetailsProps {
  solicitacao: SolicitacaoPendente | null;
  isOpen: boolean;
  onClose: (foiProcessado?: boolean) => void;
}

interface Option {
  label: string;
  value: string | number;
}

export function ModalLoanRequestDetails({
  solicitacao,
  isOpen,
  onClose,
}: ModalLoanRequestDetailsProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExemplares, setIsLoadingExemplares] = useState(false);

  const [alunoInfo, setAlunoInfo] = useState('');
  const [livroInfo, setLivroInfo] = useState('');
  const [dataSolicitacao, setDataSolicitacao] = useState('');

  const [selectedTombo, setSelectedTombo] = useState('');
  const [exemplarOptions, setExemplarOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (solicitacao && isOpen) {
      setAlunoInfo(
        `${solicitacao.alunoNome} ${solicitacao.alunoMatricula ? `(Mat: ${solicitacao.alunoMatricula})` : ''}`,
      );
      setLivroInfo(solicitacao.livroNome);

      setSelectedTombo(solicitacao.exemplarTombo || '');

      const dataObj = new Date(solicitacao.dataSolicitacao);
      setDataSolicitacao(
        dataObj.toLocaleDateString('pt-BR') +
          ' às ' +
          dataObj.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
      );

      carregarExemplaresDisponiveis(
        solicitacao.livroNome,
        solicitacao.exemplarTombo,
      );
    }
  }, [solicitacao, isOpen]);

  const carregarExemplaresDisponiveis = async (
    nomeLivro: string,
    tomboAtual?: string,
  ) => {
    setIsLoadingExemplares(true);
    try {
      const livrosRes = await buscarLivrosAgrupados(nomeLivro, 0, 1);
      const livroEncontrado = livrosRes.content.find(
        (l) => l.nome === nomeLivro,
      );

      if (livroEncontrado) {
        const exemplares = await buscarExemplaresPorLivroId(livroEncontrado.id);

        const opcoes = exemplares
          .filter(
            (ex) =>
              ex.status === 'DISPONIVEL' || ex.tomboExemplar === tomboAtual,
          )
          .map((ex) => ({
            label: `${ex.tomboExemplar} - ${ex.localizacao_fisica} ${ex.tomboExemplar === tomboAtual ? '(Reservado)' : ''}`,
            value: ex.tomboExemplar,
          }));

        setExemplarOptions(opcoes);
      }
    } catch (error) {
      console.error('Erro ao carregar exemplares:', error);
    } finally {
      setIsLoadingExemplares(false);
    }
  };

  const handleProcessar = async (aceitar: boolean) => {
    if (!solicitacao) return;

    if (aceitar && !selectedTombo) {
      addToast({
        type: 'warning',
        title: 'Atenção',
        description:
          'Por favor, selecione um exemplar para aceitar a solicitação.',
      });
      return;
    }

    const acao = aceitar ? 'aceitar' : 'recusar';
    if (!window.confirm(`Tem certeza que deseja ${acao} esta solicitação?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await processarSolicitacao(solicitacao.id, aceitar);

      addToast({
        type: 'success',
        title: 'Sucesso',
        description: `Solicitação ${aceitar ? 'aceita' : 'recusada'} com sucesso!`,
      });
      onClose(true);
    } catch (error: any) {
      console.error(`Erro ao ${acao} solicitação:`, error);

      let mensagemErro = `Erro ao ${acao} solicitação.`;

      if (error.response?.data) {
        if (typeof error.response.data.mensagem === 'string') {
          mensagemErro = error.response.data.mensagem;
        } else if (typeof error.response.data.message === 'string') {
          mensagemErro = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          mensagemErro = error.response.data;
        }
      }

      addToast({
        type: 'error',
        title: 'Atenção',
        description: mensagemErro,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';
  const disabledInputStyles =
    'w-full h-[38px] px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none text-sm flex items-center truncate';

  if (!solicitacao) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title="Solicitação de Empréstimo"
    >
      <div className="flex flex-col h-full max-h-[600px] overflow-hidden">
        <div className="overflow-y-auto p-1 flex-grow custom-scrollbar pr-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyles}>Data da Solicitação</label>
              <div className={disabledInputStyles}>{dataSolicitacao}</div>
            </div>

            <div>
              <label className={labelStyles}>Aluno</label>
              <div className={disabledInputStyles} title={alunoInfo}>
                {alunoInfo}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyles}>Livro</label>
              <div className={disabledInputStyles} title={livroInfo}>
                {livroInfo}
              </div>
            </div>

            <div>
              <label className={labelStyles}>Exemplar</label>
              <SearchableSelect
                value={selectedTombo}
                onChange={setSelectedTombo}
                options={exemplarOptions}
                placeholder="Selecione o exemplar..."
                isLoading={isLoadingExemplares}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 shrink-0 gap-4">
          <button
            onClick={() => handleProcessar(false)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : 'Recusar'}
          </button>

          <button
            onClick={() => handleProcessar(true)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Processando...' : 'Aceitar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
