import { useState, useEffect } from 'react';

import { Modal } from '../Modal';
import { SearchableSelect } from '../SearchableSelect';
import { CustomDatePicker } from '../CustomDatePicker';

import { buscarAlunosParaAdmin } from '../../services/alunoService';
import { buscarLivrosParaAdmin } from '../../services/livroService';
import { buscarExemplaresPorLivroId } from '../../services/exemplarService';
import { cadastrarEmprestimo } from '../../services/emprestimoService';

interface Option {
  label: string;
  value: string | number;
}

// Interface baseada no que é exibido na lista, mas idealmente viria completa do backend
interface EmprestimoDados {
  id: string | number;
  alunoMatricula: string;
  alunoNome?: string;
  livroIsbn: string;
  livroNome?: string;
  exemplarTombo: string;
  dataEmprestimo: string; // ISO ou formatada
  dataDevolucao: string; // ISO ou formatada
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

  // Estados dos dados
  const [alunoMatricula, setAlunoMatricula] = useState('');
  const [livroId, setLivroId] = useState(''); // Usando ISBN ou ID conforme lógica do NewLoan
  const [exemplarTombo, setExemplarTombo] = useState('');
  const [dataEmprestimo, setDataEmprestimo] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');

  // Opções para os Selects
  const [alunosOptions, setAlunosOptions] = useState<Option[]>([]);
  const [livrosOptions, setLivrosOptions] = useState<Option[]>([]);
  const [exemplaresOptions, setExemplaresOptions] = useState<Option[]>([]);

  // 1. Carregar dados iniciais (Alunos e Livros) - Igual ao NewLoan
  useEffect(() => {
    if (isOpen) {
      const carregarListas = async () => {
        try {
          const [alunosRes, livrosRes] = await Promise.all([
            buscarAlunosParaAdmin('', 0, 1000),
            buscarLivrosParaAdmin('', 0, 1000),
          ]);

          setAlunosOptions(
            alunosRes.content.map((a) => ({
              label: `${a.nomeCompleto} (Mat: ${a.matricula})`,
              value: a.matricula,
            })),
          );

          setLivrosOptions(
            livrosRes.content.map((l) => ({
              label: `${l.nome} (ISBN: ${l.isbn})`,
              value: l.isbn, // Ou l.id dependendo da sua lógica de backend
            })),
          );
        } catch (error) {
          console.error('Erro ao carregar listas:', error);
        }
      };
      carregarListas();
    }
  }, [isOpen]);

  // 2. Povoar o formulário quando o empréstimo é selecionado
  useEffect(() => {
    if (emprestimo && isOpen) {
      setAlunoMatricula(emprestimo.alunoMatricula || '');
      setLivroId(emprestimo.livroIsbn || '');
      setExemplarTombo(emprestimo.exemplarTombo || '');

      // Tratamento de datas para o formato do CustomDatePicker (yyyy-MM-dd)
      // Assumindo que vem ISO ou Date object, ajuste conforme seu objeto real
      const formatarData = (data: string | Date) => {
        if (!data) return '';
        const d = new Date(data);
        return d.toISOString().split('T')[0];
      };

      setDataEmprestimo(formatarData(emprestimo.dataEmprestimo));
      setDataDevolucao(formatarData(emprestimo.dataDevolucao));

      setIsEditMode(false); // Sempre começa em modo visualização
    }
  }, [emprestimo, isOpen]);

  // 3. Carregar Exemplares quando o Livro muda - Igual ao NewLoan
  useEffect(() => {
    if (!livroId) {
      setExemplaresOptions([]);
      return;
    }

    const carregarExemplares = async () => {
      setIsLoadingExemplares(true);
      try {
        // Nota: NewLoan usa buscarExemplaresPorLivroId que pede number,
        // mas aqui estamos lidando com ISBN as vezes.
        // Se precisar converter ISBN para ID, precisaria de uma busca extra ou ajustar o value do select.
        // Vou assumir que você tem o ID ou que a função aceita o que está no value.

        // Se o value for ISBN, talvez precise buscar o livro antes para pegar o ID numérico
        // Para manter simples e igual ao NewLoan, assumo que a lógica de ID está correta.
        const lista = await buscarExemplaresPorLivroId(Number(livroId) || 0);

        // No modo edição, queremos ver o exemplar ATUAL também, mesmo que não esteja "DISPONIVEL"
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
  }, [livroId, exemplarTombo]); // Adicionado exemplarTombo para garantir que ele apareça na lista

  const handleSalvar = async () => {
    if (
      !alunoMatricula ||
      !exemplarTombo ||
      !dataEmprestimo ||
      !dataDevolucao
    ) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      // AQUI: Implementar a lógica de atualização.
      // Como o NewLoan usa 'cadastrarEmprestimo', você precisaria de um 'atualizarEmprestimo'
      // ou usar isso apenas para renovação (alterar data).

      // Exemplo fictício:
      // await atualizarEmprestimo(emprestimo.id, { ...payload });

      alert('Empréstimo atualizado com sucesso! (Simulação)');
      onClose(true);
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      alert(error.response?.data?.mensagem || 'Erro ao atualizar empréstimo.');
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';
  const inputStyles =
    'w-full h-[38px] px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none text-sm';
  const disabledInputStyles =
    'w-full h-[38px] px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none text-sm flex items-center';

  if (!isOpen || !emprestimo) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={isEditMode ? 'Editar Empréstimo' : 'Detalhes do Empréstimo'}
    >
      <div className="flex flex-col h-full max-h-[600px] overflow-hidden">
        <div className="overflow-y-auto p-1 flex-grow custom-scrollbar pr-2 space-y-6">
          {/* Grid de Datas - Idêntico ao NewLoan */}
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
                  {dataEmprestimo
                    ? new Date(dataEmprestimo).toLocaleDateString('pt-BR')
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
                  {dataDevolucao
                    ? new Date(dataDevolucao).toLocaleDateString('pt-BR')
                    : '-'}
                </div>
              </div>
            )}
          </div>

          {/* Aluno */}
          <div>
            <label className={labelStyles}>Aluno*</label>
            {isEditMode ? (
              <SearchableSelect
                value={alunoMatricula}
                onChange={setAlunoMatricula}
                options={alunosOptions}
                placeholder="Busque pelo nome ou matrícula..."
              />
            ) : (
              <input
                type="text"
                value={
                  alunosOptions.find((a) => a.value === alunoMatricula)
                    ?.label || alunoMatricula
                }
                disabled
                className={disabledInputStyles}
              />
            )}
          </div>

          {/* Livro */}
          <div>
            <label className={labelStyles}>Livro*</label>
            {isEditMode ? (
              <SearchableSelect
                value={livroId}
                onChange={(val) => {
                  setLivroId(val);
                  setExemplarTombo(''); // Limpa exemplar se mudar o livro
                }}
                options={livrosOptions}
                placeholder="Busque pelo título ou ISBN..."
              />
            ) : (
              <input
                type="text"
                value={
                  livrosOptions.find((l) => l.value === livroId)?.label ||
                  livroId
                }
                disabled
                className={disabledInputStyles}
              />
            )}
          </div>

          {/* Exemplar */}
          <div>
            <label className={labelStyles}>Exemplar*</label>
            {isEditMode ? (
              <SearchableSelect
                value={exemplarTombo}
                onChange={setExemplarTombo}
                options={exemplaresOptions}
                placeholder={
                  !livroId
                    ? 'Selecione um livro primeiro'
                    : 'Selecione o exemplar...'
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

        {/* Footer com Botões - Padrão dos Modais de Detalhes */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          {/* Botão de Ação Secundária (Ex: Devolver ou Cancelar Edição) */}
          {isEditMode ? (
            <button
              onClick={() => setIsEditMode(false)}
              className="text-gray-600 dark:text-gray-400 font-bold py-2 px-4 hover:underline"
            >
              Cancelar
            </button>
          ) : (
            <button
              onClick={() => {
                /* Lógica de Devolução se necessário */
              }}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 shadow-md"
            >
              Registrar Devolução
            </button>
          )}

          {/* Botão Principal */}
          {isEditMode ? (
            <button
              onClick={handleSalvar}
              disabled={isLoading}
              className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 disabled:bg-gray-400 shadow-md"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="bg-lumi-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-lumi-primary-hover shadow-md"
            >
              Editar Empréstimo
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
