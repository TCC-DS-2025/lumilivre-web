import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { ActionHeader } from '../../components/ActionHeader';
import { DataTable, type ColumnDef } from '../../components/DataTable';
import { TableFooter } from '../../components/TableFooter';
import { LoanFilter } from '../../components/filters/LoanFilter';

import {
  buscarEmprestimosPaginado,
  buscarEmprestimosAvancado,
  type EmprestimoListagemDTO,
} from '../../services/emprestimoService';
import type { Page } from '../../types';
import { formatarNome } from '../../utils/formatters';
import { useDynamicPageSize } from '../../hooks/useDynamicPageSize';

type StatusEmprestimoDisplay =
  | 'ativo'
  | 'atrasado'
  | 'vence-hoje'
  | 'concluido';

const emprestimosLegend = [
  { status: 'ativo', label: 'Ativo', color: 'bg-green-500' },
  { status: 'vence-hoje', label: 'Vence Hoje', color: 'bg-yellow-500' },
  { status: 'atrasado', label: 'Atrasado', color: 'bg-red-500' },
  { status: 'concluido', label: 'Concluído', color: 'bg-gray-400' },
];

interface EmprestimoDisplay {
  id: string;
  status: StatusEmprestimoDisplay;
  livro: string;
  tombo: string;
  aluno: string;
  curso: string;
  emprestimo: Date;
  devolucao: Date;
}

export function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState<EmprestimoDisplay[]>([]);
  const [pageData, setPageData] = useState<Page<EmprestimoListagemDTO> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'dataDevolucao',
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');

  // FILTRO
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterParams, setFilterParams] = useState({
    statusEmprestimo: '',
    dataEmprestimo: '',
    dataDevolucao: '',
    tombo: '',
    livroNome: '',
    alunoNome: '',
  });
  const [activeFilters, setActiveFilters] = useState({});

  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some((val) => val !== '');
  }, [activeFilters]);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const dynamicPageSize = useDynamicPageSize(tableContainerRef, {
    rowHeight: 48,
    footerHeight: 50,
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setItemsPerPage(dynamicPageSize);
  }, [dynamicPageSize]);

  // FUNÇÃO BUSCA
  const fetchEmprestimos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sortMap: Record<string, string> = {
        status: 'statusEmprestimo',
        tombo: 'exemplar.tombo',
        livro: 'exemplar.livro.nome',
        aluno: 'aluno.nomeCompleto',
        emprestimo: 'dataEmprestimo',
        devolucao: 'dataDevolucao',
      };

      const backendKey = sortMap[sortConfig.key] || sortConfig.key;
      const sortParam = `${backendKey},${sortConfig.direction}`;

      let data: Page<EmprestimoListagemDTO>;

      if (hasActiveFilters) {
        data = await buscarEmprestimosAvancado({
          ...activeFilters,
          page: currentPage - 1,
          size: itemsPerPage,
          sort: sortParam,
        });
      } else {
        data = await buscarEmprestimosPaginado(
          filtroAtivo,
          currentPage - 1,
          itemsPerPage,
          sortParam,
        );
      }

      if (data && data.content) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const emprestimosMapeados: EmprestimoDisplay[] = data.content.map(
          (item, index) => {
            const dataDevolucao = new Date(item.dataDevolucao);
            dataDevolucao.setHours(0, 0, 0, 0);

            let status: StatusEmprestimoDisplay;

            if (item.statusEmprestimo === 'CONCLUIDO') {
              status = 'concluido';
            } else if (
              item.statusEmprestimo === 'ATRASADO' ||
              dataDevolucao.getTime() < hoje.getTime()
            ) {
              status = 'atrasado';
            } else if (dataDevolucao.getTime() === hoje.getTime()) {
              status = 'vence-hoje';
            } else {
              status = 'ativo';
            }

            return {
              id: `${item.livroTombo}-${index}`,
              status: status,
              livro: item.livroNome,
              tombo: item.livroTombo,
              aluno: item.nomeAluno,
              curso: item.curso || '-',
              emprestimo: new Date(item.dataEmprestimo),
              devolucao: new Date(item.dataDevolucao),
            };
          },
        );

        setEmprestimos(emprestimosMapeados);
        setPageData(data);
      } else {
        setEmprestimos([]);
        setPageData(null);
      }
    } catch (err: any) {
      setError('Não foi possível carregar os empréstimos.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    filtroAtivo,
    activeFilters,
    hasActiveFilters,
  ]);

  useEffect(() => {
    fetchEmprestimos();
  }, [fetchEmprestimos]);

  // HANDLERS

  const handleBusca = () => {
    setCurrentPage(1);
    setActiveFilters({});
    setFiltroAtivo(termoBusca);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setTermoBusca('');
    setFiltroAtivo('');
    setActiveFilters(filterParams);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setCurrentPage(1);
    setFilterParams({
      statusEmprestimo: '',
      dataEmprestimo: '',
      dataDevolucao: '',
      tombo: '',
      livroNome: '',
      alunoNome: '',
    });
    setActiveFilters({});
    setIsFilterOpen(false);
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // RENDERIZADORES AUXILIARES

  const StatusIndicator = ({ status }: { status: StatusEmprestimoDisplay }) => {
    const colorMap = {
      ativo: 'bg-green-500',
      atrasado: 'bg-red-500',
      'vence-hoje': 'bg-yellow-500',
      concluido: 'bg-gray-400',
    };
    return (
      <div
        className={`w-3 h-3 rounded-full mx-auto shadow-md ${colorMap[status]}`}
        title={status.replace('-', ' ').toUpperCase()}
      />
    );
  };

  const getRowClass = (status: StatusEmprestimoDisplay) => {
    const baseHover = 'hover:duration-0';
    switch (status) {
      case 'atrasado':
        return `bg-red-500/30 dark:bg-red-500/30 hover:bg-red-500/60 dark:hover:bg-red-500/60 ${baseHover}`;
      case 'vence-hoje':
        return `bg-yellow-300/25 dark:bg-yellow-300/25 hover:bg-yellow-300/55 dark:hover:bg-yellow-300/50 ${baseHover}`;
      default:
        return `hover:bg-gray-300 dark:hover:bg-gray-600 ${baseHover}`;
    }
  };

  const columns: ColumnDef<EmprestimoDisplay>[] = [
    {
      key: 'status',
      header: 'Status',
      width: '10%',
      render: (item) => <StatusIndicator status={item.status} />,
    },
    {
      key: 'tombo',
      header: 'Tombo',
      width: '10%',
      render: (item) => (
        <span className="font-bold dark:text-white">{item.tombo}</span>
      ),
    },
    {
      key: 'livro',
      header: 'Livro',
      width: '20%',
      render: (item) => (
        <span className="dark:text-gray-300 truncate">{item.livro}</span>
      ),
    },
    {
      key: 'aluno',
      header: 'Aluno',
      width: '20%',
      render: (item) => (
        <span className="font-bold dark:text-white truncate">
          {formatarNome(item.aluno)}
        </span>
      ),
    },
    {
      key: 'emprestimo',
      header: 'Empréstimo',
      width: '15%',
      render: (item) => (
        <span className="dark:text-gray-300">
          {item.emprestimo.toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'devolucao',
      header: 'Devolução',
      width: '15%',
      render: (item) => (
        <span className="font-bold dark:text-white">
          {item.devolucao.toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      width: '10%',
      isSortable: false,
      render: () => (
        <button className="bg-lumi-label text-white text-xs font-bold py-1 px-3 rounded hover:bg-opacity-75 hover:scale-105 shadow-md select-none">
          DETALHES
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <ActionHeader
        searchTerm={termoBusca}
        onSearchChange={setTermoBusca}
        onSearchSubmit={handleBusca}
        searchPlaceholder="Pesquise pelo livro, aluno ou tombo"
        onAddNew={() => {
          alert('Funcionalidade de cadastro a ser implementada.');
        }}
        addNewButtonLabel="NOVO EMPRÉSTIMO"
        showFilterButton={true}
        isFilterOpen={isFilterOpen}
        onFilterToggle={() => setIsFilterOpen((prev) => !prev)}
      />

      <div className="relative z-20">
        <LoanFilter
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filterParams}
          onFilterChange={(field, value) =>
            setFilterParams((prev) => ({ ...prev, [field]: value }))
          }
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </div>

      <div
        ref={tableContainerRef}
        className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow flex flex-col min-h-0"
      >
        <DataTable
          data={emprestimos}
          columns={columns}
          isLoading={isLoading}
          error={error}
          sortConfig={sortConfig}
          onSort={requestSort}
          getRowKey={(item) => item.id}
          getRowClass={(item) => getRowClass(item.status)}
        />

        <TableFooter
          legendItems={emprestimosLegend.map((l) => ({
            label: l.label,
            color: l.color,
          }))}
          pagination={{
            currentPage,
            totalPages: pageData?.totalPages ?? 1,
            itemsPerPage,
            totalItems: pageData?.totalElements ?? 0,
          }}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
