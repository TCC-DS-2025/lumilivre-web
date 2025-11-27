import { useState, useEffect, useMemo, useRef } from 'react';

import { StatCard } from '../../components/StatCard';
import { DataTable, type ColumnDef } from '../../components/DataTable';
import { TableFooter } from '../../components/TableFooter';
import { formatarNome } from '../../utils/formatters';
import { useDynamicPageSize } from '../../hooks/useDynamicPageSize';

import { getContagemLivros } from '../../services/livroService';
import { getContagemAlunos } from '../../services/alunoService';
import {
  getContagemAtrasados,
  getContagemEmprestimosTotais,
  buscarEmprestimosAtivosEAtrasados,
} from '../../services/emprestimoService';
import { buscarSolicitacoesPendentes } from '../../services/solicitacaoEmprestimoService';

import BookIcon from '../../assets/icons/books-active.svg?react';
import UsersIcon from '../../assets/icons/users-active.svg?react';
import AlertIcon from '../../assets/icons/alert.svg?react';
import LoansIcon from '../../assets/icons/loans-active.svg?react';

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

  const dashboardContainerRef = useRef<HTMLDivElement>(null);
  const dynamicPageSize = useDynamicPageSize(dashboardContainerRef, {
    rowHeight: 48,
    headerHeight: 100,
    footerHeight: 60,
    minRows: 3,
  });

  const [solicitacaoPage, setSolicitacaoPage] = useState(1);
  const [solicitacaoPerPage, setSolicitacaoPerPage] = useState(10);

  const [emprestimoPage, setEmprestimoPage] = useState(1);
  const [emprestimoPerPage, setEmprestimoPerPage] = useState(10);

  useEffect(() => {
    setSolicitacaoPerPage(dynamicPageSize);
    setEmprestimoPerPage(dynamicPageSize);
  }, [dynamicPageSize]);

  const [solicitacaoSort, setSolicitacaoSort] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'solicitacao', direction: 'asc' });

  const [emprestimoSort, setEmprestimoSort] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'devolucao', direction: 'asc' });

  // Solicitações
  const sortedSolicitacoes = useMemo(() => {
    const items = [...solicitacoesState.data];
    items.sort((a, b) => {
      const key = solicitacaoSort.key as keyof SolicitacaoDisplay;
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

  const paginatedSolicitacoes = useMemo(() => {
    const start = (solicitacaoPage - 1) * solicitacaoPerPage;
    return sortedSolicitacoes.slice(start, start + solicitacaoPerPage);
  }, [sortedSolicitacoes, solicitacaoPage, solicitacaoPerPage]);

  // Empréstimos
  const sortedEmprestimos = useMemo(() => {
    const items = [...emprestimosState.data];
    items.sort((a, b) => {
      const key = emprestimoSort.key as keyof EmprestimoVencer;
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

  const paginatedEmprestimos = useMemo(() => {
    const start = (emprestimoPage - 1) * emprestimoPerPage;
    return sortedEmprestimos.slice(start, start + emprestimoPerPage);
  }, [sortedEmprestimos, emprestimoPage, emprestimoPerPage]);

  const requestSolicitacaoSort = (key: string) => {
    const direction =
      solicitacaoSort.key === key && solicitacaoSort.direction === 'asc'
        ? 'desc'
        : 'asc';
    setSolicitacaoSort({ key, direction });
  };

  const requestEmprestimoSort = (key: string) => {
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
          setStatsState({ data: null as any, isLoading: false, error: 'Erro' });
        });

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

          const processados = lista.map((e) => {
            const dataDevolucao = new Date(e.dataDevolucao + 'T00:00:00');

            dataDevolucao.setHours(0, 0, 0, 0);

            let statusVencimento: EmprestimoVencer['statusVencimento'] =
              'ativo';

            if (e.statusEmprestimo === 'ATRASADO') {
              statusVencimento = 'atrasado';
            } else if (dataDevolucao.getTime() < hoje.getTime()) {
              statusVencimento = 'atrasado';
            } else if (dataDevolucao.getTime() === hoje.getTime()) {
              statusVencimento = 'vence-hoje';
            }

            return {
              id: e.id,
              livro: e.livroNome,
              isbn: '-',
              aluno: e.alunoNome,
              retirada: '-',
              devolucao: dataDevolucao.toLocaleDateString('pt-BR'),
              statusVencimento,
            };
          });

          setEmprestimosState({
            data: processados,
            isLoading: false,
            error: null,
          });
        })
        .catch((err) => {
          console.error(err);
          setEmprestimosState({
            data: [],
            isLoading: false,
            error: 'Erro ao carregar empréstimos.',
          });
        });
    };

    carregarDados();
  }, []);

  const getRowClass = (item: EmprestimoVencer) => {
    const baseHover = 'hover:duration-0';
    switch (item.statusVencimento) {
      case 'atrasado':
        return `bg-red-500/30 dark:bg-red-500/30 hover:bg-red-500/40 dark:hover:bg-red-500/40 ${baseHover}`;
      case 'vence-hoje':
        return `bg-yellow-300/25 dark:bg-yellow-300/25 hover:bg-yellow-300/40 dark:hover:bg-yellow-300/35 ${baseHover}`;
      case 'ativo':
      default:
        return `hover:bg-gray-300 dark:hover:bg-gray-600 ${baseHover}`;
    }
  };

  const solicitacoesColumns: ColumnDef<SolicitacaoDisplay>[] = [
    {
      key: 'aluno',
      header: 'Aluno',
      width: '25%',
      render: (item) => (
        <span className="text-gray-700 dark:text-gray-300 truncate">
          {formatarNome(item.aluno)}
        </span>
      ),
    },
    {
      key: 'livro',
      header: 'Livro',
      width: '30%',
      render: (item) => (
        <span className="text-gray-700 dark:text-gray-300 truncate">
          {item.livro}
        </span>
      ),
    },
    {
      key: 'solicitacao',
      header: 'Solicitação',
      width: '25%',
      render: (item) => (
        <span className="dark:text-white font-bold">
          {item.solicitacao.toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      width: '20%',
      isSortable: false,
      render: () => (
        <button className="bg-lumi-label text-white text-xs font-bold py-1 px-3 rounded hover:bg-opacity-75 hover:scale-105 shadow-md select-none">
          Detalhes
        </button>
      ),
    },
  ];

  const emprestimosColumns: ColumnDef<EmprestimoVencer>[] = [
    {
      key: 'aluno',
      header: 'Aluno',
      width: '25%',
      render: (item) => (
        <span className="text-gray-700 dark:text-gray-300 truncate">
          {formatarNome(item.aluno)}
        </span>
      ),
    },
    {
      key: 'livro',
      header: 'Livro',
      width: '30%',
      render: (item) => (
        <span className="text-gray-700 dark:text-gray-300 truncate">
          {item.livro}
        </span>
      ),
    },
    {
      key: 'devolucao',
      header: 'Devolução',
      width: '25%',
      render: (item) => (
        <span className="dark:text-white font-bold">{item.devolucao}</span>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      width: '20%',
      isSortable: false,
      render: () => (
        <button className="bg-lumi-label text-white text-xs font-bold py-1 px-3 rounded hover:bg-opacity-75 hover:scale-105 shadow-md select-none">
          Detalhes
        </button>
      ),
    },
  ];

  const dashboardHeaderClass =
    'h-8 bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700 shadow-sm';
  const dashboardHeaderTextClass = 'text-gray-800 dark:text-white';
  const dashboardHoverClass = 'hover:bg-gray-200 dark:hover:bg-gray-700';

  return (
    <div className="flex flex-col h-full will-change-transform">
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

      <div
        ref={dashboardContainerRef}
        className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0"
      >
        {/* Solicitações de Empréstimo */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md flex flex-col min-h-0 will-change-transform">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 shrink-0 select-none">
            Solicitações de Empréstimo
          </h3>

          <DataTable
            data={paginatedSolicitacoes}
            columns={solicitacoesColumns}
            isLoading={solicitacoesState.isLoading}
            error={solicitacoesState.error}
            sortConfig={solicitacaoSort}
            onSort={requestSolicitacaoSort}
            getRowKey={(item) => item.id}
            emptyStateMessage="Nenhuma solicitação pendente."
            headerClassName={dashboardHeaderClass}
            headerTextClassName={dashboardHeaderTextClass}
            hoverHeaderClassName={dashboardHoverClass}
            hasRoundedBorderTop={false}
          />

          <TableFooter
            viewMode={'exception'}
            className="h-8"
            selectClassName="h-6"
            pagination={{
              currentPage: solicitacaoPage,
              totalPages: Math.ceil(
                sortedSolicitacoes.length / solicitacaoPerPage,
              ),
              itemsPerPage: solicitacaoPerPage,
              totalItems: sortedSolicitacoes.length,
            }}
            onPageChange={setSolicitacaoPage}
            onItemsPerPageChange={(size) => {
              setSolicitacaoPerPage(size);
              setSolicitacaoPage(1);
            }}
          />
        </div>

        {/* Empréstimos Ativos */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md flex flex-col min-h-0 will-change-transform">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 shrink-0 select-none">
            Empréstimos Ativos
          </h3>

          <DataTable
            data={paginatedEmprestimos}
            columns={emprestimosColumns}
            isLoading={emprestimosState.isLoading}
            error={emprestimosState.error}
            sortConfig={emprestimoSort}
            onSort={requestEmprestimoSort}
            getRowKey={(item) => item.id}
            getRowClass={getRowClass}
            emptyStateMessage="Nenhum empréstimo ativo no momento."
            headerClassName={dashboardHeaderClass}
            headerTextClassName={dashboardHeaderTextClass}
            hoverHeaderClassName={dashboardHoverClass}
            hasRoundedBorderTop={false}
          />

          <TableFooter
            viewMode={'exception'}
            className="h-8"
            selectClassName="h-6"
            pagination={{
              currentPage: emprestimoPage,
              totalPages: Math.ceil(
                sortedEmprestimos.length / emprestimoPerPage,
              ),
              itemsPerPage: emprestimoPerPage,
              totalItems: sortedEmprestimos.length,
            }}
            onPageChange={setEmprestimoPage}
            onItemsPerPageChange={(size) => {
              setEmprestimoPerPage(size);
              setEmprestimoPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}
