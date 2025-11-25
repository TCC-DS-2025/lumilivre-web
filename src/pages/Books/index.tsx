import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { useDynamicPageSize } from '../../hooks/useDynamicPageSize';
import { ActionHeader } from '../../components/ActionHeader';
import { DataTable, type ColumnDef } from '../../components/DataTable';
import { TableFooter } from '../../components/TableFooter';
import { Modal } from '../../components/Modal';
import { NovoLivro } from '../../components/forms/NewBook';
import { NovoExemplar } from '../../components/forms/NewExemplar';
import { DetalhesLivroModal } from '../../components/ModalBookDetails';
import { BookFilter } from '../../components/filters/BookFilter';
import BackIcon from '../../assets/icons/arrow-left.svg?react';

import {
  buscarLivrosAgrupados,
  buscarLivrosAvancado,
  type LivroAgrupado,
  type ListaLivro,
} from '../../services/livroService';
import {
  buscarExemplaresPorLivroId,
  excluirExemplar,
} from '../../services/exemplarService';
import {
  buscarEmprestimosAtivosEAtrasados,
  type EmprestimoAtivoDTO,
} from '../../services/emprestimoService';
import type { Page } from '../../types';

const livrosLegend = [
  { label: 'Disponível', color: 'bg-green-500' },
  { label: 'Emprestado', color: 'bg-yellow-500' },
];

export function LivrosPage() {
  const [isExemplarView, setIsExemplarView] = useState(false);
  const [selectedBook, setSelectedBook] = useState<LivroAgrupado | null>(null);

  const [livrosAgrupados, setLivrosAgrupados] = useState<LivroAgrupado[]>([]);
  const [exemplares, setExemplares] = useState<ListaLivro[]>([]);

  // PAGINAÇÃO
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<Page<any> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'nome',
    direction: 'asc',
  });

  const [termoBusca, setTermoBusca] = useState('');
  const [termoBuscaAtivo, setTermoBuscaAtivo] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [livroSelecionado, setLivroSelecionado] =
    useState<LivroAgrupado | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterParams, setFilterParams] = useState({
    autor: '',
    editora: '',
    genero: '',
    cdd: '',
    classificacaoEtaria: '',
    tipoCapa: '',
    dataLancamento: '',
  });
  const [activeFilters, setActiveFilters] = useState({});

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const dynamicPageSize = useDynamicPageSize(tableContainerRef, {
    rowHeight: 48,
    footerHeight: 50,
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setItemsPerPage(dynamicPageSize);
  }, [dynamicPageSize]);

  // BUSCA DE DADOS
  const fetchDados = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isExemplarView && selectedBook) {
        const [listaExemplares, emprestimosAtivos] = await Promise.all([
          buscarExemplaresPorLivroId(selectedBook.id),
          buscarEmprestimosAtivosEAtrasados(),
        ]);

        const mapaEmprestimos = new Map<string, string>();

        emprestimosAtivos.forEach((emp: EmprestimoAtivoDTO) => {
          if (emp.tombo) {
            mapaEmprestimos.set(emp.tombo, emp.alunoNome);
          }
        });

        const exemplaresComResponsavel = (listaExemplares || []).map((ex) => ({
          ...ex,
          responsavel: mapaEmprestimos.get(ex.tomboExemplar) || '-',
        }));

        exemplaresComResponsavel.sort((a, b) => {
          if (a.status === 'DISPONIVEL' && b.status !== 'DISPONIVEL') return -1;
          if (a.status !== 'DISPONIVEL' && b.status === 'DISPONIVEL') return 1;
          return a.tomboExemplar.localeCompare(b.tomboExemplar);
        });
        setExemplares(exemplaresComResponsavel);
        setPageData({
          content: exemplaresComResponsavel,
          totalElements: exemplaresComResponsavel.length,
          totalPages: Math.ceil(exemplaresComResponsavel.length / itemsPerPage),
        } as Page<any>);
      } else {
        const hasActiveFilters = Object.values(activeFilters).some(
          (val) => val !== '',
        );

        let paginaDeLivros;

        if (hasActiveFilters) {
          paginaDeLivros = await buscarLivrosAvancado({
            ...activeFilters,
            page: currentPage - 1,
            size: itemsPerPage,
            sort: `${sortConfig.key},${sortConfig.direction}`,
          });
        } else {
          paginaDeLivros = await buscarLivrosAgrupados(
            termoBuscaAtivo,
            currentPage - 1,
            itemsPerPage,
            `${sortConfig.key},${sortConfig.direction}`,
          );
        }

        setLivrosAgrupados(paginaDeLivros?.content || []);
        setPageData(paginaDeLivros || null);
      }
    } catch (err: any) {
      if (
        err.response &&
        (err.response.status === 404 || err.response.status === 204)
      ) {
        if (isExemplarView) {
          setExemplares([]);
        } else {
          setLivrosAgrupados([]);
        }
        setError(null);
      } else {
        setError('Não foi possível carregar os dados.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isExemplarView,
    selectedBook,
    termoBuscaAtivo,
    currentPage,
    itemsPerPage,
    sortConfig,
    activeFilters,
  ]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setTermoBusca('');
    setActiveFilters(filterParams);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setCurrentPage(1);
    setFilterParams({
      autor: '',
      editora: '',
      genero: '',
      cdd: '',
      classificacaoEtaria: '',
      tipoCapa: '',
      dataLancamento: '',
    });
    setActiveFilters({});
    setIsFilterOpen(false);
  };

  const handleSearchSubmit = () => {
    setTermoBuscaAtivo(termoBusca);
    setCurrentPage(1);
  };

  const handleVerExemplares = useCallback((livro: LivroAgrupado) => {
    setSelectedBook(livro);
    setIsExemplarView(true);
    setActiveFilters({});
    setTermoBusca('');
  }, []);

  const handleVoltarParaLivros = () => {
    setIsExemplarView(false);
    setSelectedBook(null);
    setTermoBusca('');
    setTermoBuscaAtivo('');
    setCurrentPage(1);
  };

  const handleAbrirDetalhes = useCallback((livro: LivroAgrupado) => {
    setLivroSelecionado(livro);
    setIsDetalhesOpen(true);
  }, []);

  const handleFecharDetalhes = (foiAtualizado?: boolean) => {
    setIsDetalhesOpen(false);
    setLivroSelecionado(null);
    if (foiAtualizado) {
      fetchDados();
    }
  };

  const handleExcluirExemplar = useCallback(
    async (tombo: string) => {
      if (
        window.confirm(
          `Tem certeza que deseja excluir o exemplar de tombo "${tombo}"?`,
        )
      ) {
        try {
          await excluirExemplar(tombo);
          alert('Exemplar excluído com sucesso!');
          fetchDados();
        } catch (error: any) {
          alert(
            `Erro ao excluir exemplar: ${error.response?.data?.mensagem || 'Erro desconhecido'}`,
          );
        }
      }
    },
    [fetchDados],
  );

  const StatusIndicator = ({ status }: { status: string }) => {
    const statusInfo = {
      DISPONIVEL: { color: 'bg-green-500', title: 'Disponível' },
      EMPRESTADO: { color: 'bg-yellow-500', title: 'Emprestado' },
    };
    const info = statusInfo[status as keyof typeof statusInfo] || {
      color: 'bg-gray-200',
      title: 'Desconhecido',
    };
    return (
      <div
        className={`w-3 h-3 rounded-full mx-auto shadow-md ${info.color}`}
        title={info.title}
      />
    );
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exemplaresFiltrados = useMemo(() => {
    if (!isExemplarView) return [];
    if (!termoBusca.trim()) return exemplares;

    return exemplares.filter((ex) =>
      ex.tomboExemplar.toLowerCase().includes(termoBusca.toLowerCase()),
    );
  }, [exemplares, isExemplarView, termoBuscaAtivo]);

  const dadosPaginados = useMemo(() => {
    const source = isExemplarView ? exemplaresFiltrados : livrosAgrupados;
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return source.slice(firstPageIndex, lastPageIndex);
  }, [
    currentPage,
    itemsPerPage,
    livrosAgrupados,
    exemplaresFiltrados,
    isExemplarView,
  ]);

  // DEFINIÇÃO DE COLUNAS

  const livrosColumns = useMemo(
    (): ColumnDef<LivroAgrupado>[] => [
      {
        key: 'isbn',
        header: 'ISBN',
        width: '15%',
        render: (item) => (
          <span className="font-bold dark:text-white">{item.isbn || '-'}</span>
        ),
      },
      {
        key: 'nome',
        header: 'Livro',
        width: '25%',
        render: (item) => (
          <span className="font-bold dark:text-white truncate">
            {item.nome}
          </span>
        ),
      },
      {
        key: 'autor',
        header: 'Autor',
        width: '20%',
        render: (item) => (
          <span className="dark:text-gray-300 truncate">{item.autor}</span>
        ),
      },
      {
        key: 'editora',
        header: 'Editora',
        width: '15%',
        render: (item) => (
          <span className="dark:text-gray-300 truncate">{item.editora}</span>
        ),
      },
      {
        key: 'quantidade',
        header: 'Qtd.',
        width: '5%',
        render: (item) => (
          <span className="font-bold dark:text-white">{item.quantidade}</span>
        ),
      },
      {
        key: 'acoes',
        header: 'Ações',
        width: '20%',
        isSortable: false,
        render: (item) => (
          <div className="flex justify-center items-center gap-x-2">
            <button
              onClick={() => handleVerExemplares(item)}
              className="bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded hover:bg-opacity-75 hover:scale-105 shadow-md"
            >
              EXEMPLARES
            </button>
            <button
              onClick={() => handleAbrirDetalhes(item)}
              className="bg-lumi-label text-white text-xs font-bold py-1 px-3 rounded hover:bg-opacity-75 hover:scale-105 shadow-md select-none"
            >
              DETALHES
            </button>
          </div>
        ),
      },
    ],
    [handleVerExemplares, handleAbrirDetalhes],
  );

  const exemplaresColumns = useMemo(
    (): ColumnDef<ListaLivro>[] => [
      {
        key: 'status',
        header: 'Status',
        width: '15%',
        render: (item) => <StatusIndicator status={item.status} />,
      },
      {
        key: 'tomboExemplar',
        header: 'Tombo',
        width: '20%',
        render: (item) => (
          <span className="font-bold dark:text-white">
            {item.tomboExemplar}
          </span>
        ),
      },
      {
        key: 'localizacao_fisica',
        header: 'Localização',
        width: '30%',
        render: (item) => (
          <span className="dark:text-gray-300">{item.localizacao_fisica}</span>
        ),
      },
      {
        key: 'responsavel',
        header: 'Responsável',
        width: '25%',
        render: (item) => (
          <span className="dark:text-gray-300">{item.responsavel}</span>
        ),
      },
      {
        key: 'acoes',
        header: 'Ações',
        width: '15%',
        isSortable: false,
        render: (item) => (
          <button
            onClick={() => handleExcluirExemplar(item.tomboExemplar)}
            className="bg-red-600 text-white text-xs font-bold py-1 px-3 rounded hover:bg-red-700 hover:scale-105 shadow-md"
          >
            EXCLUIR
          </button>
        ),
      },
    ],
    [handleExcluirExemplar],
  );

  return (
    <div className="flex flex-col h-full">
      <div
        key={isExemplarView ? 'header-exemplares' : 'header-livros'}
        className={`shrink-0 ${
          isExemplarView ? 'animate-slide-in-right' : 'animate-slide-in-left'
        }`}
      >
        <ActionHeader
          searchTerm={termoBusca}
          onSearchChange={setTermoBusca}
          onSearchSubmit={handleSearchSubmit}
          inputWidth={isExemplarView ? 'w-[300px]' : 'w-[500px]'}
          searchPlaceholder={
            isExemplarView
              ? 'Pesquise pelo tombo'
              : 'Pesquise pelo nome ou isbn'
          }
          onAddNew={() => setIsModalOpen(true)}
          addNewButtonLabel={isExemplarView ? 'NOVO EXEMPLAR' : 'NOVO LIVRO'}
          showFilterButton={!isExemplarView}
          isFilterOpen={isFilterOpen}
          onFilterToggle={() => setIsFilterOpen((prev) => !prev)}
        >
          {isExemplarView && selectedBook && (
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <button
                onClick={handleVoltarParaLivros}
                className="p-2 rounded-l-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <BackIcon className="m-0.5 mx-1.5 w-5 h-5 text-lumi-primary dark:text-lumi-label" />
              </button>

              <div className="flex items-center overflow-hidden mr-4">
                <span className="text-lg font-bold text-gray-800 dark:text-white whitespace-nowrap mx-2 ml-4">
                  Exemplares de:
                </span>
                <span
                  className="text-lg font-bold text-lumi-primary dark:text-lumi-label max-w-[400px] truncate"
                  title={selectedBook.nome}
                >
                  {selectedBook.nome}
                </span>
              </div>

              <button
                onClick={() => handleAbrirDetalhes(selectedBook!)}
                className="bg-lumi-label text-white text-xs font-bold py-1 px-3 mr-4 rounded hover:bg-opacity-75 hover:scale-105 shadow-md"
              >
                DETALHES
              </button>
            </div>
          )}
        </ActionHeader>
      </div>

      {/* Filtro Avançado */}
      <div className="relative z-20">
        <BookFilter
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          isExemplarView ? 'Cadastrar Novo Exemplar' : 'Cadastrar Novo Livro'
        }
      >
        {isExemplarView && selectedBook ? (
          <NovoExemplar
            livroIsbn={selectedBook.isbn}
            livroNome={selectedBook.nome}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchDados}
          />
        ) : (
          <NovoLivro
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchDados}
          />
        )}
      </Modal>

      <DetalhesLivroModal
        isOpen={isDetalhesOpen}
        onClose={handleFecharDetalhes}
        livro={livroSelecionado}
      />

      <div
        ref={tableContainerRef}
        className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow flex flex-col min-h-0 overflow-hidden"
      >
        {isExemplarView ? (
          // VIEW DE EXEMPLARES
          <div
            key="view-exemplares"
            className="flex flex-col h-full animate-slide-in-right"
          >
            <DataTable<ListaLivro>
              data={dadosPaginados as ListaLivro[]}
              columns={exemplaresColumns}
              isLoading={isLoading}
              error={error}
              sortConfig={sortConfig}
              onSort={requestSort}
              getRowKey={(item) => item.tomboExemplar}
              hasRoundedBorderTop={false}
            />
            <TableFooter
              viewMode="normal"
              legendItems={livrosLegend}
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
        ) : (
          // VIEW DE LIVROS
          <div
            key="view-livros"
            className="flex flex-col h-full animate-slide-in-left"
          >
            <DataTable<LivroAgrupado>
              data={dadosPaginados as LivroAgrupado[]}
              columns={livrosColumns}
              isLoading={isLoading}
              error={error}
              sortConfig={sortConfig}
              onSort={requestSort}
              getRowKey={(item) => item.id}
              hasRoundedBorderTop={false}
            />
            <TableFooter
              viewMode="exception"
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
        )}
      </div>
    </div>
  );
}
