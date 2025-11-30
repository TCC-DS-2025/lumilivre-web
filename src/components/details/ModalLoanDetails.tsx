import { useState, useEffect } from 'react';

import { Modal } from '../Modal';
import { SearchableSelect } from '../SearchableSelect';
import { CustomDatePicker } from '../CustomDatePicker';
import { useToast } from '../../contexts/ToastContext';

import { buscarAlunosParaAdmin } from '../../services/alunoService';
import { buscarLivrosAgrupados } from '../../services/livroService';
import { buscarExemplaresPorLivroId } from '../../services/exemplarService';
import {
  atualizarEmprestimo,
  concluirEmprestimo,
  excluirEmprestimo,
  type EmprestimoPayload,
} from '../../services/emprestimoService';

interface Option {
  label: string;
  value: string | number;
}

interface EmprestimoDados {
  id: string | number;
  alunoMatricula: string;
  alunoNome?: string;
  livroIsbn: string;
  livroNome?: string;
  exemplarTombo: string;
  dataEmprestimo: string;
  dataDevolucao: string;
}

interface ModalLoanDetailsProps {
  emprestimo: EmprestimoDados | null;
  isOpen: boolean;
  onClose: (foiAtualizado?: boolean) => void;
}

export function ModalLoanDetails({
  emprestimo,
  isOpen,
  onClose,
}: ModalLoanDetailsProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExemplares, setIsLoadingExemplares] = useState(false);

  const { addToast } = useToast();

  const [alunoMatricula, setAlunoMatricula] = useState('');
  const [livroId, setLivroId] = useState('');
  const [exemplarTombo, setExemplarTombo] = useState('');
  const [dataEmprestimo, setDataEmprestimo] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');

  const [alunosOptions, setAlunosOptions] = useState<Option[]>([]);
  const [livrosOptions, setLivrosOptions] = useState<Option[]>([]);
  const [exemplaresOptions, setExemplaresOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (isOpen) {
      const carregarListas = async () => {
        try {
          const [alunosRes, livrosRes] = await Promise.all([
            buscarAlunosParaAdmin('', 0, 1000),
            buscarLivrosAgrupados('', 0, 1000),
          ]);

          setAlunosOptions(
            alunosRes.content.map((a) => ({
              label: `${a.nomeCompleto} (Mat: ${a.matricula})`,
              value: a.matricula,
            })),
          );

          setLivrosOptions(
            livrosRes.content.map((l) => ({
              label: `${l.nome} (ISBN: ${l.isbn || 'S/N'})`,
              value: l.id,
            })),
          );
        } catch (error) {
          console.error('Erro ao carregar listas:', error);
        }
      };
      carregarListas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (emprestimo && isOpen) {
      setAlunoMatricula(emprestimo.alunoMatricula || '');
      setExemplarTombo(emprestimo.exemplarTombo || '');

      const formatarData = (data: string | Date) => {
        if (!data) return '';
        const d = new Date(data);
        return d.toISOString().split('T')[0];
      };

      setDataEmprestimo(formatarData(emprestimo.dataEmprestimo));
      setDataDevolucao(formatarData(emprestimo.dataDevolucao));

      if (livrosOptions.length > 0) {
        let livroEncontrado = undefined;

        if (emprestimo.livroIsbn && emprestimo.livroIsbn !== '-') {
          livroEncontrado = livrosOptions.find((opt) =>
            opt.label.includes(emprestimo.livroIsbn),
          );
        }

        if (!livroEncontrado && emprestimo.livroNome) {
          livroEncontrado = livrosOptions.find((opt) =>
            opt.label
              .toLowerCase()
              .includes(emprestimo.livroNome!.toLowerCase()),
          );
        }

        if (livroEncontrado) {
          setLivroId(String(livroEncontrado.value));
        } else {
          setLivroId('');
        }
      }

      setIsEditMode(false);
    }
  }, [emprestimo, isOpen, livrosOptions]);

  useEffect(() => {
    if (!livroId) {
      setExemplaresOptions([]);
      return;
    }

    const carregarExemplares = async () => {
      setIsLoadingExemplares(true);
      try {
        const lista = await buscarExemplaresPorLivroId(Number(livroId) || 0);

        const disponiveisOuAtual = lista.filter(
          (ex) =>
            ex.status === 'DISPONIVEL' || ex.tomboExemplar === exemplarTombo,
        );

        setExemplaresOptions(
          disponiveisOuAtual.map((ex) => ({
            label: `Tombo: ${ex.tomboExemplar} - Local: ${ex.localizacao_fisica} ${ex.tomboExemplar === exemplarTombo ? '(Atual)' : ''}`,
            value: ex.tomboExemplar,
          })),
        );
      } catch (error) {
        console.error('Erro ao buscar exemplares', error);
        setExemplaresOptions([]);
      } finally {
        setIsLoadingExemplares(false);
      }
    };

    carregarExemplares();
  }, [livroId, exemplarTombo]);

  const formatarDataParaBackend = (dataIso: string): string => {
    if (!dataIso) return '';
    const [ano, mes, dia] = dataIso.split('-');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    return `${dia}/${mes}/${ano} ${horaAtual}`;
  };

  const handleSalvar = async () => {
    if (!emprestimo) return;
    if (
      !alunoMatricula ||
      !exemplarTombo ||
      !dataEmprestimo ||
      !dataDevolucao
    ) {
      addToast({
        type: 'warning',
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload: EmprestimoPayload = {
        id: Number(emprestimo.id),
        aluno_matricula: alunoMatricula,
        exemplar_tombo: exemplarTombo,
        data_emprestimo: formatarDataParaBackend(dataEmprestimo),
        data_devolucao: formatarDataParaBackend(dataDevolucao),
      };

      await atualizarEmprestimo(Number(emprestimo.id), payload);
      addToast({
        type: 'success',
        title: 'Sucesso',
        description: 'Empréstimo atualizado com sucesso!',
      });
      onClose(true);
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      addToast({
        type: 'error',
        title: 'Erro ao atualizar',
        description:
          error.response?.data?.mensagem || 'Erro ao atualizar empréstimo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevolucao = async () => {
    if (!emprestimo) return;
    if (!window.confirm('Confirmar a devolução deste livro?')) return;

    setIsLoading(true);
    try {
      await concluirEmprestimo(Number(emprestimo.id));
      addToast({
        type: 'success',
        title: 'Devolução registrada',
        description: 'Devolução registrada com sucesso!',
      });
      onClose(true);
    } catch (error: any) {
      console.error('Erro na devolução:', error);
      addToast({
        type: 'error',
        title: 'Erro na devolução',
        description:
          error.response?.data?.mensagem || 'Erro ao registrar devolução.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluir = async () => {
    if (!emprestimo) return;
    if (
      !window.confirm(
        'Tem certeza que deseja EXCLUIR este registro de empréstimo? Essa ação não pode ser desfeita.',
      )
    )
      return;

    setIsLoading(true);
    try {
      await excluirEmprestimo(Number(emprestimo.id));
      addToast({
        type: 'success',
        title: 'Empréstimo excluído',
        description: 'Empréstimo excluído com sucesso!',
      });
      onClose(true);
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      addToast({
        type: 'error',
        title: 'Erro ao excluir',
        description:
          error.response?.data?.mensagem || 'Erro ao excluir empréstimo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';
  const disabledInputStyles =
    'w-full h-[38px] px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none text-sm flex items-center truncate';

  if (!emprestimo) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={isEditMode ? 'Editar Empréstimo' : 'Detalhes do Empréstimo'}
    >
      <div className="flex flex-col h-full max-h-[600px] overflow-hidden">
        <div className="overflow-y-auto p-1 flex-grow custom-scrollbar pr-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditMode ? (
              <CustomDatePicker
                label="Data do Empréstimo*"
                value={dataEmprestimo}
                onChange={(e) => setDataEmprestimo(e.target.value)}
              />
            ) : (
              <div>
                <label className={labelStyles}>Data do Empréstimo</label>
                <div className={disabledInputStyles}>
                  {dataEmprestimo && dataEmprestimo.includes('-')
                    ? dataEmprestimo.split('-').reverse().join('/')
                    : '-'}
                </div>
              </div>
            )}

            {isEditMode ? (
              <CustomDatePicker
                label="Data de Devolução*"
                value={dataDevolucao}
                onChange={(e) => setDataDevolucao(e.target.value)}
              />
            ) : (
              <div>
                <label className={labelStyles}>Data de Devolução</label>
                <div className={disabledInputStyles}>
                  {dataDevolucao && dataDevolucao.includes('-')
                    ? dataDevolucao.split('-').reverse().join('/')
                    : '-'}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelStyles}>Aluno*</label>
              {isEditMode ? (
                <SearchableSelect
                  value={alunoMatricula}
                  onChange={setAlunoMatricula}
                  options={alunosOptions}
                />
              ) : (
                <input
                  type="text"
                  value={
                    alunosOptions.find((a) => a.value === alunoMatricula)
                      ?.label ||
                    emprestimo.alunoNome ||
                    alunoMatricula
                  }
                  disabled
                  className={disabledInputStyles}
                />
              )}
            </div>

            <div>
              <label className={labelStyles}>Livro*</label>
              {isEditMode ? (
                <SearchableSelect
                  value={livroId}
                  onChange={(val) => {
                    setLivroId(val);
                    setExemplarTombo('');
                  }}
                  options={livrosOptions}
                />
              ) : (
                <input
                  type="text"
                  value={emprestimo.livroNome || emprestimo.livroIsbn}
                  disabled
                  className={disabledInputStyles}
                />
              )}
            </div>

            <div>
              <label className={labelStyles}>Exemplar*</label>
              {isEditMode ? (
                <SearchableSelect
                  value={exemplarTombo}
                  onChange={setExemplarTombo}
                  options={exemplaresOptions}
                  placeholder={
                    !livroId ? 'Selecione um livro' : 'Selecione um exemplar'
                  }
                  disabled={!livroId || isLoadingExemplares}
                  isLoading={isLoadingExemplares}
                />
              ) : (
                <input
                  type="text"
                  value={exemplarTombo}
                  disabled
                  className={disabledInputStyles}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={handleExcluir}
            disabled={isLoading || isEditMode}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            Excluir
          </button>

          <div className="flex gap-3">
            {isEditMode ? (
              <>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="text-gray-600 dark:text-gray-400 font-bold py-2 px-4 hover:underline"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={isLoading}
                  className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 disabled:bg-gray-400 shadow-md"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="bg-lumi-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-lumi-primary-hover shadow-md"
                >
                  Editar
                </button>
                <button
                  onClick={handleDevolucao}
                  disabled={isLoading}
                  className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 shadow-md"
                >
                  {isLoading ? 'Processando...' : 'Registrar Devolução'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
