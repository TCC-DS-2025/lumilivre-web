import { useState, useEffect, useMemo } from 'react';

import { StatCard } from '../../components/StatCard';
import { SortableTh } from '../../components/SortableTh';
import type { Emprestimo } from '../../types';
import { LoadingIcon } from '../../components/LoadingIcon';

import BookIcon from '../../assets/icons/books-active.svg?react';
import UsersIcon from '../../assets/icons/users-active.svg?react';
import AlertIcon from '../../assets/icons/alert.svg?react';
import LoansIcon from '../../assets/icons/loans-active.svg?react';

import { getContagemLivros } from '../../services/livroService';
import { getContagemAlunos } from '../../services/alunoService';
import {
  getContagemAtrasados,
  getContagemEmprestimosTotais,
  buscarEmprestimosAtivosEAtrasados,
} from '../../services/emprestimoService';
import { buscarSolicitacoesPendentes } from '../../services/solicitacaoEmprestimoService';

interface DataState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
}

interface StatsData {
  livros: number;
  alunos: number;
  emprestimosAtivos: number;
  atrasados: number;
}

interface EmprestimoVencer {
  id: number;
  livro: string;
  isbn: string;
  aluno: string;
  retirada: string;
  devolucao: string;
  statusVencimento: 'atrasado' | 'vence-hoje' | 'ativo';
}

interface SolicitacaoDisplay {
  id: number;
  aluno: string;
  livro: string;
  solicitacao: Date;
}

export function DashboardPage() {
  const [statsState, setStatsState] = useState<DataState<StatsData | null>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const [solicitacoesState, setSolicitacoesState] = useState<
    DataState<SolicitacaoDisplay[]>
  >({
    data: [],
    isLoading: true,
    error: null,
  });

  const [emprestimosState, setEmprestimosState] = useState<
    DataState<EmprestimoVencer[]>
  >({
    data: [],
    isLoading: true,
    error: null,
  });

  // Configurações de Ordenação
  const [solicitacaoSort, setSolicitacaoSort] = useState<{
    key: keyof SolicitacaoDisplay;
    direction: 'asc' | 'desc';
  }>({ key: 'solicitacao', direction: 'asc' });

  const [emprestimoSort, setEmprestimoSort] = useState<{
    key: keyof EmprestimoVencer;
    direction: 'asc' | 'desc';
  }>({ key: 'devolucao', direction: 'asc' });

  // Lógica de Ordenação
  const sortedSolicitacoes = useMemo(() => {
    const items = [...solicitacoesState.data];
    items.sort((a, b) => {
      const key = solicitacaoSort.key;
      if (key === 'solicitacao') {
        return solicitacaoSort.direction === 'asc'
          ? a.solicitacao.getTime() - b.solicitacao.getTime()
          : b.solicitacao.getTime() - a.solicitacao.getTime();
      }
      if (a[key] < b[key]) return solicitacaoSort.direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return solicitacaoSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [solicitacoesState.data, solicitacaoSort]);

  const sortedEmprestimos = useMemo(() => {
    const items = [...emprestimosState.data];
    items.sort((a, b) => {
      const key = emprestimoSort.key;
      if (key === 'devolucao') {
        const dateA = new Date(a.devolucao.split('/').reverse().join('-'));
        const dateB = new Date(b.devolucao.split('/').reverse().join('-'));
        return emprestimoSort.direction === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      if (a[key] < b[key]) return emprestimoSort.direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return emprestimoSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [emprestimosState.data, emprestimoSort]);

  const requestSolicitacaoSort = (key: keyof SolicitacaoDisplay) => {
    const direction =
      solicitacaoSort.key === key && solicitacaoSort.direction === 'asc'
        ? 'desc'
        : 'asc';
    setSolicitacaoSort({ key, direction });
  };

  const requestEmprestimoSort = (key: keyof EmprestimoVencer) => {
    const direction =
      emprestimoSort.key === key && emprestimoSort.direction === 'asc'
        ? 'desc'
        : 'asc';
    setEmprestimoSort({ key, direction });
  };

  useEffect(() => {
    const carregarDados = async () => {
      getContagemLivros()
        .then((livros) =>
          Promise.all([
            livros,
            getContagemAlunos(),
            getContagemEmprestimosTotais(),
            getContagemAtrasados(),
          ]),
        )
        .then(([livros, alunos, emprestimosAtivos, atrasados]) => {
          setStatsState({
            data: { livros, alunos, emprestimosAtivos, atrasados },
            isLoading: false,
            error: null,
          });
        })
        .catch(() => {
          setStatsState({ data: null, isLoading: false, error: 'Erro' });
        });

      // Carregar Solicitações
      buscarSolicitacoesPendentes()
        .then((lista) => {
          const processadas = lista.map((s) => ({
            id: s.id,
            aluno: s.alunoNome,
            livro: s.livroNome,
            solicitacao: new Date(s.dataSolicitacao),
          }));
          setSolicitacoesState({
            data: processadas,
            isLoading: false,
            error: null,
          });
        })
        .catch(() => {
          setSolicitacoesState({
            data: [],
            isLoading: false,
            error: 'Erro ao carregar solicitações.',
          });
        });

      buscarEmprestimosAtivosEAtrasados()
        .then((lista) => {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          const processados = lista.map((e: Emprestimo) => {
            const dataDevolucao = new Date(e.dataDevolucao);
            dataDevolucao.setHours(0, 0, 0, 0);

            let statusVencimento: EmprestimoVencer['statusVencimento'] =
              'ativo';
            if (dataDevolucao < hoje) statusVencimento = 'atrasado';
            else if (dataDevolucao.getTime() === hoje.getTime())
              statusVencimento = 'vence-hoje';

            return {
              id: e.id,
              livro: e.exemplar?.livro?.nome || 'Livro não encontrado',
              isbn: e.exemplar?.livro?.isbn || 'N/A',
              aluno: e.aluno?.nomeCompleto || 'Aluno não encontrado',
              retirada: new Date(e.dataEmprestimo).toLocaleDateString('pt-BR'),
              devolucao: new Date(e.dataDevolucao).toLocaleDateString('pt-BR'),
              statusVencimento,
            };
          });
          setEmprestimosState({
            data: processados,
            isLoading: false,
            error: null,
          });
        })
        .catch(() => {
          setEmprestimosState({
            data: [],
            isLoading: false,
            error: 'Erro ao carregar empréstimos.',
          });
        });
    };

    carregarDados();
  }, []);

  const getRowClass = (status: EmprestimoVencer['statusVencimento']) => {
    const baseHover = 'transition-colors duration-200 hover:duration-0';
    switch (status) {
      case 'atrasado':
        return `bg-red-500/30 dark:bg-red-500/30 hover:bg-red-500/40 dark:hover:bg-red-500/40 ${baseHover}`;
      case 'vence-hoje':
        return `bg-yellow-300/25 dark:bg-yellow-300/25 hover:bg-yellow-300/40 dark:hover:bg-yellow-300/35 ${baseHover}`;
      case 'ativo':
      default:
        return `hover:bg-gray-300 dark:hover:bg-gray-600 ${baseHover}`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 shrink-0">
        <StatCard
          to="/livros"
          Icon={BookIcon}
          title="LIVROS"
          value={statsState.data?.livros ?? 0}
          isLoading={statsState.isLoading}
          hasError={!!statsState.error}
        />
        <StatCard
          to="/alunos"
          Icon={UsersIcon}
          title="ALUNOS"
          value={statsState.data?.alunos ?? 0}
          isLoading={statsState.isLoading}
          hasError={!!statsState.error}
        />
        <StatCard
          to="/emprestimos"
          Icon={LoansIcon}
          title="EMPRÉSTIMOS"
          value={statsState.data?.emprestimosAtivos ?? 0}
          isLoading={statsState.isLoading}
          hasError={!!statsState.error}
        />
        <StatCard
          to="/emprestimos"
          Icon={AlertIcon}
          title="PENDÊNCIAS"
          value={statsState.data?.atrasados ?? 0}
          variant="danger"
          isLoading={statsState.isLoading}
          hasError={!!statsState.error}
        />
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Tabela: Solicitações de Empréstimo */}
        <div className="bg-white dark:bg-dark-card transition-all duration-200 p-6 rounded-lg shadow-md flex flex-col min-h-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 shrink-0 select-none transition-all duration-200">
            Solicitações de Empréstimo
          </h3>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-center table-fixed">
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead className="sticky top-0 bg-white dark:bg-dark-card transition-all duration-200 shadow-md dark:shadow-sm dark:shadow-white z-20">
                <tr className="select-none">
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 w-2/5 transition-all duration-200"
                    onClick={() => requestSolicitacaoSort('aluno')}
                    sortConfig={solicitacaoSort}
                    sortKey="aluno"
                  >
                    Aluno
                  </SortableTh>
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 w-2/5 transition-all duration-200"
                    onClick={() => requestSolicitacaoSort('livro')}
                    sortConfig={solicitacaoSort}
                    sortKey="livro"
                  >
                    Livro
                  </SortableTh>
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 w-1/5 transition-all duration-200"
                    onClick={() => requestSolicitacaoSort('solicitacao')}
                    sortConfig={solicitacaoSort}
                    sortKey="solicitacao"
                  >
                    Solicitação
                  </SortableTh>
                  <th className="py-2 px-2 text-sm font-bold text-gray-800 dark:text-white transition-all duration-200">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white dark:bg-dark-card transition-colors duration-200">
                {solicitacoesState.isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8">
                      <div className="flex justify-center h-24">
                        <LoadingIcon />
                      </div>
                    </td>
                  </tr>
                ) : solicitacoesState.error ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-red-500">
                      {solicitacoesState.error}
                    </td>
                  </tr>
                ) : sortedSolicitacoes.length > 0 ? (
                  sortedSolicitacoes.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:duration-0"
                    >
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {item.aluno}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {item.livro}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-white font-bold">
                        {item.solicitacao.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-2">
                        <button className="bg-lumi-label text-white text-xs font-bold py-1 px-3 rounded hover:bg-opacity-75 transition-all duration-200 hover:scale-105 shadow-md select-none">
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Nenhuma solicitação pendente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabela: Empréstimos Ativos */}
        <div className="bg-white dark:bg-dark-card transition-all duration-200 p-6 rounded-lg shadow-md flex flex-col min-h-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 shrink-0 select-none transition-all duration-200">
            Empréstimos Ativos
          </h3>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-center table-fixed">
              <colgroup>
                <col style={{ width: '30%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <thead className="sticky top-0 bg-white dark:bg-dark-card transition-all duration-200 shadow-md dark:shadow-sm dark:shadow-white z-20">
                <tr className="select-none">
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    onClick={() => requestEmprestimoSort('livro')}
                    sortConfig={emprestimoSort}
                    sortKey="livro"
                  >
                    Livro
                  </SortableTh>
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    onClick={() => requestEmprestimoSort('aluno')}
                    sortConfig={emprestimoSort}
                    sortKey="aluno"
                  >
                    Aluno
                  </SortableTh>
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    onClick={() => requestEmprestimoSort('devolucao')}
                    sortConfig={emprestimoSort}
                    sortKey="devolucao"
                  >
                    Devolução
                  </SortableTh>
                  <th className="py-2 px-2 text-sm font-bold text-gray-800 dark:text-white transition-all duration-200">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white dark:bg-dark-card transition-colors duration-200">
                {emprestimosState.isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8">
                      <div className="flex justify-center h-24">
                        <LoadingIcon />
                      </div>
                    </td>
                  </tr>
                ) : emprestimosState.error ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-red-500">
                      {emprestimosState.error}
                    </td>
                  </tr>
                ) : sortedEmprestimos.length > 0 ? (
                  sortedEmprestimos.map((item) => (
                    <tr
                      key={item.id}
                      className={getRowClass(item.statusVencimento)}
                    >
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {item.livro}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {item.aluno}
                      </td>
                      <td className="py-3 px-2 text-sm font-medium text-gray-700 dark:text-white">
                        {item.devolucao}
                      </td>
                      <td className="py-3 px-2">
                        <button className="bg-lumi-label text-white text-xs font-bold py-1 px-3 rounded hover:bg-opacity-75 transition-all duration-200 hover:scale-105 shadow-md select-none">
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Nenhum empréstimo ativo no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
