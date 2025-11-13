import { useState, useEffect, useCallback } from 'react';

import { ActionHeader } from '../../components/ActionHeader';
import { DataTable, type ColumnDef } from '../../components/DataTable';
import { TableFooter } from '../../components/TableFooter';

import {
  buscarEmprestimosPaginado,
  type ListaEmprestimo,
} from '../../services/emprestimoService';
import type { Page } from '../../types';

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
  id: number;
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
  const [pageData, setPageData] = useState<Page<ListaEmprestimo> | null>(null);
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [termoBusca, setTermoBusca] = useState('');

  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchEmprestimos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sortParam = `${sortConfig.key},${sortConfig.direction}`;
      const data = await buscarEmprestimosPaginado(
        termoBusca,
        currentPage - 1,
        itemsPerPage,
        sortParam,
      );

      if (data && data.content) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const emprestimosMapeados: EmprestimoDisplay[] = data.content.map(
          (item) => {
            const dataDevolucao = new Date(item.dataDevolucao);
            dataDevolucao.setHours(0, 0, 0, 0);

            let status: StatusEmprestimoDisplay;

            if (item.statusEmprestimo === 'CONCLUIDO') {
              status = 'concluido';
            } else if (item.statusEmprestimo === 'ATRASADO') {
              status = 'atrasado';
            } else if (dataDevolucao.getTime() === hoje.getTime()) {
              status = 'vence-hoje';
            } else {
              status = 'ativo';
            }

            return {
              id: item.id,
              status: status,
              livro: item.exemplar.livro.nome,
              tombo: item.exemplar.tombo,
              aluno: item.aluno.nomeCompleto,
              curso: item.aluno.curso.nome,
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
  }, [currentPage, itemsPerPage, sortConfig, termoBusca]);

  useEffect(() => {
    fetchEmprestimos();
  }, [fetchEmprestimos]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // const handleSearch = () => {
  //   setCurrentPage(1);
  //   fetchEmprestimos();
  // };

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
    const baseHover = 'transition-colors duration-200 hover:duration-0';
    switch (status) {
      case 'atrasado':
        return `bg-red-500/30 dark:bg-red-500/30 hover:bg-red-500/60 dark:hover:bg-red-500/60 ${baseHover}`;
      case 'vence-hoje':
        return `bg-yellow-300/25 dark:bg-yellow-300/25 hover:bg-yellow-300/55 dark:hover:bg-yellow-300/50 ${baseHover}`;
      default:
        return `hover:bg-gray-300 dark:hover:bg-gray-600 ${baseHover}`;
    }
  };

  // colunas para a tabela
  const columns: ColumnDef<EmprestimoDisplay>[] = [
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusIndicator status={item.status} />,
    },
    {
      key: 'tombo',
      header: 'Tombo',
      render: (item) => (
        <span className="font-bold dark:text-white">{item.tombo}</span>
      ),
    },
    {
      key: 'livro',
      header: 'Livro',
      render: (item) => (
        <span className="dark:text-gray-300 truncate">{item.livro}</span>
      ),
    },
    {
      key: 'aluno',
      header: 'Aluno',
      render: (item) => <span className="font-bold dark:text-white truncate">{item.aluno}</span>,
    },
    {
      // data de retirada do livro?
      key: 'emprestimo',
      header: 'Empréstimo',
      render: (item) => (
        <span className="dark:text-gray-300">
          {item.emprestimo.toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'devolucao',
      header: 'Devolução',
      render: (item) => (
        <span className="font-bold dark:text-white">
          {item.devolucao.toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      isSortable: false,
      render: () => (
        <button className="bg-lumi-primary text-white text-xs font-bold py-1 px-3 rounded hover:bg-lumi-primary-hover transition-transform duration-200 hover:scale-105 shadow-md select-none">
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
        onSearchSubmit={() => {
          alert('Funcionalidade de busca a ser implementada.');
        }}
        searchPlaceholder="Pesquise pelo livro, aluno ou tombo"
        onAddNew={() => {
          alert('Funcionalidade de cadastro a ser implementada.');
        }}
        addNewButtonLabel="NOVO EMPRÉSTIMO"
        showFilterButton={true}
        onFilterToggle={() => {
          alert('Funcionalidade de filtro avançado a ser implementada.');
        }}
      />

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow flex flex-col min-h-0 transition-all duration-200">
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
