import { useState, useEffect, useMemo, useCallback } from 'react';

import { ActionHeader } from '../../components/ActionHeader';
import { DataTable, type ColumnDef } from '../../components/DataTable';
import { TableFooter } from '../../components/TableFooter';

import { Modal } from '../../components/Modal';
import { NovoLivro } from '../../components/forms/NewBook';
import { NovoExemplar } from '../../components/forms/NewExemplar';
import { DetalhesLivroModal } from '../../components/ModalBookDetails';

import backIconUrl from '../../assets/icons/arrow-left.svg';

import {
  buscarLivrosAgrupados,
  type LivroAgrupado,
  type ListaLivro,
} from '../../services/livroService';
import {
  buscarExemplaresPorLivroId,
  excluirExemplar,
} from '../../services/exemplarService';
import { buscarEmprestimosAtivosEAtrasados } from '../../services/emprestimoService';
import type { Page, Emprestimo } from '../../types';

const livrosLegend = [
  { label: 'Disponível', color: 'bg-green-500' },
  { label: 'Emprestado', color: 'bg-yellow-500' },
];

export function LivrosPage() {
  // estados de controle de view
  const [isExemplarView, setIsExemplarView] = useState(false);
  const [selectedBook, setSelectedBook] = useState<LivroAgrupado | null>(null);

  // estados de dados
  const [livrosAgrupados, setLivrosAgrupados] = useState<LivroAgrupado[]>([]);
  const [exemplares, setExemplares] = useState<ListaLivro[]>([]);

  // estados de ui e paginação
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<Page<any> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'nome',
    direction: 'asc',
  });
  const [termoBusca, setTermoBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // estados do botão de detalhes
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [livroSelecionado, setLivroSelecionado] =
    useState<LivroAgrupado | null>(null);

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
        emprestimosAtivos.forEach((emp: Emprestimo) => {
          if (emp.exemplar.tombo) {
            mapaEmprestimos.set(emp.exemplar.tombo, emp.aluno.nomeCompleto);
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
        const paginaDeLivros = await buscarLivrosAgrupados(
          termoBusca,
          currentPage - 1,
          itemsPerPage,
          `${sortConfig.key},${sortConfig.direction}`,
        );
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
    termoBusca,
    currentPage,
    itemsPerPage,
    sortConfig,
  ]);
  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  const handleVerExemplares = useCallback((livro: LivroAgrupado) => {
    setSelectedBook(livro);
    setIsExemplarView(true);
  }, []);

  const handleVoltarParaLivros = () => {
    setIsExemplarView(false);
    setSelectedBook(null);
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

  // paginação para a lista de exemplares
  const exemplaresFiltrados = useMemo(() => {
    if (!isExemplarView) return [];
    if (!termoBusca.trim()) return exemplares;

    return exemplares.filter((ex) =>
      ex.tomboExemplar.toLowerCase().includes(termoBusca.toLowerCase()),
    );
  }, [exemplares, isExemplarView, termoBusca]);

  // paginação para a lista de livros agrupados
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

  // colunas para tabela (LIVROS AGRUPADOS)
  const livrosColumns = useMemo(
    (): ColumnDef<LivroAgrupado>[] => [
      {
        key: 'isbn',
        header: 'ISBN',
        width: '15%',
        render: (item) => (
          <span className="font-bold dark:text-white">{item.isbn}</span>
        ),
      },
      {
        key: 'nome',
        header: 'Livro',
        width: '30%',
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
        width: '10%',
        render: (item) => (
          <span className="font-bold dark:text-white">{item.quantidade}</span>
        ),
      },
      {
        key: 'acoes',
        header: 'Ações',
        width: '10%',
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

  // colunas para tabela (EXEMPLARES)
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
      <ActionHeader
        searchTerm={termoBusca}
        onSearchChange={setTermoBusca}
        onSearchSubmit={fetchDados}
        searchPlaceholder={
          isExemplarView
            ? 'Pesquise pelo tombo do exemplar'
            : 'Pesquise pelo nome ou ISBN do livro'
        }
        onAddNew={() => setIsModalOpen(true)}
        addNewButtonLabel={isExemplarView ? 'NOVO EXEMPLAR' : 'NOVO LIVRO'}
        showFilterButton={!isExemplarView}
        onFilterToggle={() => {
          alert('Funcionalidade de filtro avançado a ser implementada.');
        }}
      >
        {isExemplarView && selectedBook && (
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <button
              onClick={handleVoltarParaLivros}
              className="p-2 rounded-l-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <img src={backIconUrl} alt="Voltar" className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mx-4">
              Exemplares de: {/* truncate para não aparecer em duas linhas */}
              <span className="text-lumi-primary truncate">
                {selectedBook.nome}
              </span>
            </h2>
            <button
              onClick={() => handleAbrirDetalhes(selectedBook!)}
              className="bg-lumi-label text-white text-xs font-bold py-1 px-3 mr-4 rounded hover:bg-opacity-75 hover:scale-105 shadow-md"
            >
              DETALHES
            </button>
          </div>
        )}
      </ActionHeader>

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

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow flex flex-col min-h-0">
        {isExemplarView ? (
          <DataTable<ListaLivro>
            data={dadosPaginados as ListaLivro[]}
            columns={exemplaresColumns}
            isLoading={isLoading}
            error={error}
            sortConfig={sortConfig}
            onSort={requestSort}
            getRowKey={(item) => item.tomboExemplar}
          />
        ) : (
          <DataTable<LivroAgrupado>
            data={dadosPaginados as LivroAgrupado[]}
            columns={livrosColumns}
            isLoading={isLoading}
            error={error}
            sortConfig={sortConfig}
            onSort={requestSort}
            getRowKey={(item) => item.id}
          />
        )}

        <TableFooter
          viewMode={isExemplarView ? 'normal' : 'exception'}
          legendItems={isExemplarView ? livrosLegend : undefined}
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
