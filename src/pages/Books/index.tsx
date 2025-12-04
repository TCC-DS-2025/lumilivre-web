import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { useDynamicPageSize } from '../../hooks/useDynamicPageSize';
import { ActionHeader } from '../../components/ActionHeader';
import { DataTable, type ColumnDef } from '../../components/DataTable';
import { TableFooter } from '../../components/TableFooter';
import { Modal } from '../../components/Modal';
import { NovoLivro } from '../../components/forms/NewBook';
import { NovoExemplar } from '../../components/forms/NewExemple';
import { DetalhesLivroModal } from '../../components/details/ModalBookDetails';
import { ModalExemplarDetails } from '../../components/details/ModalExempleDetails';
import { BookFilter } from '../../components/filters/BookFilter';
import BackIcon from '../../assets/icons/arrow-left.svg?react';

import {
  type LivroAgrupado,
  type ListaLivro,
} from '../../services/livroService';
import { type EmprestimoAtivoDTO } from '../../services/emprestimoService';
import {
  useLivros,
  useExemplares,
  useEmprestimosAtivosEAtrasados,
} from '../../hooks/useDomainQueries';

const livrosLegend = [
  { label: 'Disponível', color: 'bg-green-500' },
  { label: 'Emprestado', color: 'bg-yellow-500' },
];

export function LivrosPage() {
  const [isExemplarView, setIsExemplarView] = useState(false);
  const [selectedBook, setSelectedBook] = useState<LivroAgrupado | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [tempBookCreated, setTempBookCreated] = useState<LivroAgrupado | null>(
    null,
  );

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
  const [isDetalhesExemplarOpen, setIsDetalhesExemplarOpen] = useState(false);
  const [exemplarSelecionado, setExemplarSelecionado] =
    useState<ListaLivro | null>(null);

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

  const {
    data: livrosPageData,
    isLoading: isLivrosLoading,
    error: livrosError,
    refetch: refetchLivros,
  } = useLivros(
    currentPage - 1,
    itemsPerPage || 10,
    `${sortConfig.key},${sortConfig.direction}`,
    termoBuscaAtivo,
    activeFilters,
  );

  const {
    data: exemplaresData,
    isLoading: isExemplaresLoading,
    error: exemplaresError,
    refetch: refetchExemplares,
  } = useExemplares(selectedBook?.id || null);

  const { data: emprestimosAtivos } = useEmprestimosAtivosEAtrasados();

  const handleLivroCriado = (livroResponse: any) => {
    refetchLivros();

    const novoLivro: LivroAgrupado = {
      id: livroResponse.id,
      isbn: livroResponse.isbn,
      nome: livroResponse.nome,
      autor: livroResponse.autor,
      editora: livroResponse.editora,
      quantidade: 0,
    };

    setTempBookCreated(novoLivro);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmarCadastroExemplar = () => {
    setIsConfirmModalOpen(false);

    if (tempBookCreated) {
      setSelectedBook(tempBookCreated);
      setIsExemplarView(true);

      setTermoBusca('');
      setTermoBuscaAtivo('');
      setCurrentPage(1);

      setIsModalOpen(true);
    }
  };

  const handleRecusarCadastroExemplar = () => {
    setIsConfirmModalOpen(false);
    setTempBookCreated(null);
  };

  const exemplaresProcessados = useMemo(() => {
    if (!exemplaresData) return [];

    const mapaEmprestimos = new Map<string, string>();
    if (emprestimosAtivos) {
      emprestimosAtivos.forEach((emp: EmprestimoAtivoDTO) => {
        if (emp.tombo) {
          mapaEmprestimos.set(emp.tombo, emp.alunoNome);
        }
      });
    }

    const lista = exemplaresData.map((ex) => ({
      ...ex,
      responsavel: mapaEmprestimos.get(ex.tomboExemplar) || '-',
    }));

    return lista.sort((a, b) => {
      if (a.status === 'DISPONIVEL' && b.status !== 'DISPONIVEL') return -1;
      if (a.status !== 'DISPONIVEL' && b.status === 'DISPONIVEL') return 1;
      return a.tomboExemplar.localeCompare(b.tomboExemplar);
    });
  }, [exemplaresData, emprestimosAtivos]);

  const exemplaresFiltrados = useMemo(() => {
    if (!isExemplarView) return [];
    if (!termoBusca.trim()) return exemplaresProcessados;

    return exemplaresProcessados.filter((ex) =>
      ex.tomboExemplar.toLowerCase().includes(termoBusca.toLowerCase()),
    );
  }, [exemplaresProcessados, isExemplarView, termoBuscaAtivo, termoBusca]);

  const dadosPaginados = useMemo(() => {
    if (isExemplarView) {
      const source = exemplaresFiltrados;
      const firstPageIndex = (currentPage - 1) * itemsPerPage;
      const lastPageIndex = firstPageIndex + itemsPerPage;
      return source.slice(firstPageIndex, lastPageIndex);
    }
    return livrosPageData?.content || [];
  }, [
    currentPage,
    itemsPerPage,
    livrosPageData,
    exemplaresFiltrados,
    isExemplarView,
  ]);

  const isLoading = isExemplarView ? isExemplaresLoading : isLivrosLoading;
  const error = isExemplarView
    ? exemplaresError
      ? 'Erro ao carregar exemplares'
      : null
    : livrosError
      ? 'Erro ao carregar livros'
      : null;

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
    if (!termoBusca.trim()) return;
    setTermoBuscaAtivo(termoBusca);
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    setTermoBusca('');
    setTermoBuscaAtivo('');
    setCurrentPage(1);
  };

  const handleVerExemplares = useCallback((livro: LivroAgrupado) => {
    setSelectedBook(livro);
    setIsExemplarView(true);
    setActiveFilters({});
    setTermoBusca('');
    setCurrentPage(1);
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

  const handleAbrirDetalhesExemplar = useCallback((exemplar: ListaLivro) => {
    setExemplarSelecionado(exemplar);
    setIsDetalhesExemplarOpen(true);
  }, []);

  const handleFecharDetalhesLivro = (foiAtualizado?: boolean) => {
    setIsDetalhesOpen(false);
    setLivroSelecionado(null);
    if (foiAtualizado) {
      refetchLivros();
    }
  };

  const handleFecharDetalhesExemplar = (foiAtualizado?: boolean) => {
    setIsDetalhesExemplarOpen(false);
    setExemplarSelecionado(null);
    if (foiAtualizado) {
      refetchExemplares();
      refetchLivros();
    }
  };

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
        header: 'Qtd',
        width: '5%',
        render: (item) => (
          <span className="font-bold dark:text-white">
            {item.quantidade !== null && item.quantidade !== undefined
              ? item.quantidade
              : '-'}
          </span>
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
        width: '25%',
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
          <div className="flex justify-center">
            <button
              onClick={() => handleAbrirDetalhesExemplar(item)}
              className="bg-lumi-label text-white text-xs font-bold py-1 px-3 rounded hover:bg-opacity-75 hover:scale-105 shadow-md select-none"
            >
              DETALHES
            </button>
          </div>
        ),
      },
    ],
    [handleAbrirDetalhesExemplar],
  );

  return (
    <div className="flex flex-col h-full">
      <div
        key={isExemplarView ? 'header-exemplares' : 'header-livros'}
        className={`shrink-0 relative z-40 ${
          isExemplarView ? 'animate-slide-in-right' : 'animate-slide-in-left'
        }`}
      >
        <ActionHeader
          searchTerm={termoBusca}
          onSearchChange={setTermoBusca}
          onSearchSubmit={handleSearchSubmit}
          onReset={handleResetSearch}
          inputWidth={isExemplarView ? 'w-[300px]' : 'w-[500px]'}
          searchPlaceholder={
            isExemplarView
              ? 'Pesquise pelo tombo do exemplar'
              : 'Pesquise pelo nome ou isbn do livro'
          }
          onAddNew={() => setIsModalOpen(true)}
          addNewButtonLabel={isExemplarView ? 'NOVO EXEMPLAR' : 'NOVO LIVRO'}
          showFilterButton={!isExemplarView}
          isFilterOpen={isFilterOpen}
          onFilterToggle={() => setIsFilterOpen((prev) => !prev)}
          filterComponent={
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
          }
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
                DETALHES LIVRO
              </button>
            </div>
          )}
        </ActionHeader>
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
            livroId={selectedBook.id}
            livroIsbn={selectedBook.isbn}
            livroNome={selectedBook.nome}
            onClose={() => setIsModalOpen(false)}
            onSuccess={refetchExemplares}
          />
        ) : (
          <NovoLivro
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleLivroCriado}
          />
        )}
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleRecusarCadastroExemplar}
        title="Cadastro de Exemplar"
      >
        <div className="flex flex-col gap-4">
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            Livro cadastrado com sucesso! <br />
            <strong>Deseja cadastrar um exemplar físico agora?</strong>
          </p>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleRecusarCadastroExemplar}
              className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
            >
              Não, fazer depois
            </button>
            <button
              onClick={handleConfirmarCadastroExemplar}
              className="px-6 py-2 rounded-lg bg-lumi-primary text-white hover:bg-lumi-primary-hover font-bold shadow-md"
            >
              Sim, cadastrar
            </button>
          </div>
        </div>
      </Modal>

      <DetalhesLivroModal
        isOpen={isDetalhesOpen}
        onClose={handleFecharDetalhesLivro}
        livro={livroSelecionado}
      />

      <ModalExemplarDetails
        isOpen={isDetalhesExemplarOpen}
        onClose={handleFecharDetalhesExemplar}
        exemplar={exemplarSelecionado}
        livroId={selectedBook ? selectedBook.id : null}
      />

      <div
        ref={tableContainerRef}
        className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow flex flex-col min-h-0 overflow-hidden"
      >
        {isExemplarView ? (
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
                totalPages: Math.ceil(
                  exemplaresFiltrados.length / (itemsPerPage || 1),
                ),
                itemsPerPage: itemsPerPage || 10,
                totalItems: exemplaresFiltrados.length,
              }}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(size) => {
                setItemsPerPage(size);
                setCurrentPage(1);
              }}
            />
          </div>
        ) : (
          <div key="view-livros" className="flex flex-col h-full">
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
                totalPages: livrosPageData?.totalPages ?? 1,
                itemsPerPage: itemsPerPage || 10,
                totalItems: livrosPageData?.totalElements ?? 0,
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
