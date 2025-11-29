import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ActionHeader } from '../../components/ActionHeader';
import { DataTable, type ColumnDef } from '../../components/DataTable';
import { TableFooter } from '../../components/TableFooter';
import { LoanFilter } from '../../components/filters/LoanFilter';
import { Modal } from '../../components/Modal';
import { NovoEmprestimo } from '../../components/forms/NewLoan';
import { ModalLoanDetails } from '../../components/details/ModalLoanDetails';

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
  { status: 'atrasado', label: 'Vencido', color: 'bg-red-500' },
  { status: 'concluido', label: 'Concluído', color: 'bg-gray-400' },
];

interface EmprestimoDisplay {
  id: string;
  rawId: number;
  status: StatusEmprestimoDisplay;
  livro: string;
  isbn: string;
  tombo: string;
  aluno: string;
  matriculaAluno: string;
  curso: string;
  emprestimo: string;
  devolucao: string;
  rawDataEmprestimo: string;
  rawDataDevolucao: string;
}

const formatarDataIso = (dataIso: string): string => {
  if (!dataIso) return '-';
  const [dataPart] = dataIso.split('T');
  if (!dataPart) return '-';
  const [ano, mes, dia] = dataPart.split('-');
  return `${dia}/${mes}/${ano}`;
};

const cleanFilters = (filters: any) => {
  const cleaned: any = {};
  Object.keys(filters).forEach((key) => {
    if (
      filters[key] !== '' &&
      filters[key] !== null &&
      filters[key] !== undefined
    ) {
      cleaned[key] = filters[key];
    }
  });
  return cleaned;
};

export function EmprestimosPage() {
  const [searchParams] = useSearchParams();

  const filtroAtrasadosObj = {
    statusEmprestimo: 'ATRASADO',
    dataEmprestimo: '',
    dataDevolucao: '',
    tombo: '',
    livroNome: '',
    alunoNome: '',
  };

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
    key: 'status',
    direction: 'asc',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState<{
    id: number;
    alunoMatricula: string;
    livroIsbn: string;
    livroNome?: string;
    exemplarTombo: string;
    dataEmprestimo: string;
    dataDevolucao: string;
  } | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filterParams, setFilterParams] = useState(() => {
    if (searchParams.get('filtro') === 'atrasados') {
      return filtroAtrasadosObj;
    }
    return {
      statusEmprestimo: '',
      dataEmprestimo: '',
      dataDevolucao: '',
      tombo: '',
      livroNome: '',
      alunoNome: '',
    };
  });

  const [activeFilters, setActiveFilters] = useState(() => {
    if (searchParams.get('filtro') === 'atrasados') {
      return filtroAtrasadosObj;
    }
    return {};
  });

  useEffect(() => {
    const filtroUrl = searchParams.get('filtro');

    if (filtroUrl === 'atrasados') {
      setFilterParams(filtroAtrasadosObj);
      setActiveFilters(filtroAtrasadosObj);
    }
  }, [searchParams]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some((val) => val !== '');
  }, [activeFilters]);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const dynamicPageSizeOptions = useMemo(
    () => ({
      rowHeight: 48,
      footerHeight: 50,
    }),
    [],
  );
  const dynamicPageSize = useDynamicPageSize(
    tableContainerRef,
    dynamicPageSizeOptions,
  );
  const [itemsPerPage, setItemsPerPage] = useState(0);
  
  useEffect(() => {
    if (dynamicPageSize > 0) {
      setItemsPerPage(dynamicPageSize);
    }
  }, [dynamicPageSize]);

  // FUNÇÃO BUSCA
  const fetchEmprestimos = useCallback(async () => {
    if (itemsPerPage === 0) return;

    setIsLoading(true);
    setError(null);
    try {
      const sortMap: Record<string, string> = {
        status: 'status',
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
        const filtrosLimpos = cleanFilters(activeFilters);

        data = await buscarEmprestimosAvancado({
          ...filtrosLimpos,
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
            const dataDevolucaoObj = new Date(item.dataDevolucao);
            dataDevolucaoObj.setHours(0, 0, 0, 0);

            let status: StatusEmprestimoDisplay;

            if (item.statusEmprestimo === 'CONCLUIDO') {
              status = 'concluido';
            } else if (
              item.statusEmprestimo === 'ATRASADO' ||
              dataDevolucaoObj.getTime() < hoje.getTime()
            ) {
              status = 'atrasado';
            } else if (dataDevolucaoObj.getTime() === hoje.getTime()) {
              status = 'vence-hoje';
            } else {
              status = 'ativo';
            }

            return {
              id: `${item.livroTombo}-${index}`,
              rawId: item.id,
              status: status,
              livro: item.livroNome,
              isbn: '',
              tombo: item.livroTombo,
              aluno: item.nomeAluno,
              matriculaAluno: item.matriculaAluno,
              curso: item.curso || '-',
              emprestimo: formatarDataIso(item.dataEmprestimo),
              devolucao: formatarDataIso(item.dataDevolucao),
              rawDataEmprestimo: item.dataEmprestimo
                ? item.dataEmprestimo.split('T')[0]
                : '',
              rawDataDevolucao: item.dataDevolucao
                ? item.dataDevolucao.split('T')[0]
                : '',
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
    if (!termoBusca.trim()) return;
    setCurrentPage(1);
    setActiveFilters({});
    setFiltroAtivo(termoBusca);
  };

  const handleResetSearch = () => {
    setTermoBusca('');
    setFiltroAtivo('');
    setCurrentPage(1);
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

  const handleAbrirDetalhes = (item: EmprestimoDisplay) => {
    setEmprestimoSelecionado({
      id: item.rawId,
      alunoMatricula: item.matriculaAluno,
      livroIsbn: item.isbn,
      livroNome: item.livro,
      exemplarTombo: item.tombo,
      dataEmprestimo: item.rawDataEmprestimo,
      dataDevolucao: item.rawDataDevolucao,
    });
    setIsDetalhesOpen(true);
  };

  const handleFecharDetalhes = (foiAtualizado?: boolean) => {
    setIsDetalhesOpen(false);
    if (foiAtualizado) {
      fetchEmprestimos();
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      direction = 'asc';
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
        <span className="dark:text-gray-300">{item.emprestimo}</span>
      ),
    },
    {
      key: 'devolucao',
      header: 'Devolução',
      width: '15%',
      render: (item) => (
        <span className="font-bold dark:text-white">{item.devolucao}</span>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      width: '10%',
      isSortable: false,
      render: (item) => (
        <button
          onClick={() => handleAbrirDetalhes(item)}
          className="bg-lumi-label text-white text-xs font-bold py-1 px-3 rounded hover:bg-opacity-75 hover:scale-105 shadow-md select-none"
        >
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
        onReset={handleResetSearch}
        searchPlaceholder="Pesquise pelo livro, aluno ou tombo do empréstimo"
        onAddNew={() => setIsModalOpen(true)}
        addNewButtonLabel="NOVO EMPRÉSTIMO"
        showFilterButton={true}
        isFilterOpen={isFilterOpen}
        onFilterToggle={() => setIsFilterOpen((prev) => !prev)}
        // Filtro Avançado
        filterComponent={
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
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Empréstimo"
      >
        <NovoEmprestimo
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchEmprestimos}
        />
      </Modal>

      <ModalLoanDetails
        isOpen={isDetalhesOpen}
        onClose={handleFecharDetalhes}
        emprestimo={emprestimoSelecionado}
      />

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
