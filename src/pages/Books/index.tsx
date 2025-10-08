import { useState, useEffect, useMemo, useCallback } from 'react';

import { SortableTh } from '../../components/SortableTh';
import { TableFooter } from '../../components/TableFooter';
import { Modal } from '../../components/Modal';
import { LoadingIcon } from '../../components/LoadingIcon';
import { NovoLivro } from '../../components/forms/NewBook';
import { NovoExemplar } from '../../components/forms/NewExemplar';

import filterIconUrl from '../../assets/icons/filter.svg';
import addIconUrl from '../../assets/icons/add.svg';
import searchIconUrl from '../../assets/icons/search.svg';
import backIconUrl from '../../assets/icons/arrow-left.svg';

import {
  buscarLivrosAgrupados,
  type LivroAgrupado,
  type ListaLivro,
} from '../../services/livroService';
import { buscarExemplaresPorIsbn } from '../../services/exemplarService';
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

  const fetchDados = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isExemplarView && selectedBook) {
        const [listaExemplares, emprestimosAtivos] = await Promise.all([
          buscarExemplaresPorIsbn(selectedBook.isbn),
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

  const handleVerExemplares = (livro: LivroAgrupado) => {
    setSelectedBook(livro);
    setIsExemplarView(true);
  };

  const handleVoltarParaLivros = () => {
    setIsExemplarView(false);
    setSelectedBook(null);
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          {/* botão voltar + titulo do livro */}
          {isExemplarView && selectedBook && (
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-200">
              <button
                onClick={handleVoltarParaLivros}
                className="p-2 rounded-l-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <img src={backIconUrl} alt="Voltar" className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mx-4 transition-all duration-200">
                Exemplares de:{' '}
                <span className="text-lumi-primary">{selectedBook.nome}</span>
              </h2>
              <button className="bg-lumi-primary text-white text-xs font-bold py-1 px-3 mr-4 rounded hover:bg-lumi-primary-hover transition-all duration-200 hover:scale-105 shadow-md">
                DETALHES
              </button>
            </div>
          )}

          {/* input de pesquisa, filtro avançado e novo livro */}
          <div className="relative ml-3 mr-2 transition-all duration-200 select-none">
            <button className="absolute inset-y-0 right-0 px-4 rounded-r-lg flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200">
              <img src={searchIconUrl} alt="Pesquisar" className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder={
                isExemplarView
                  ? 'Pesquise por nome/isbn/tombo'
                  : 'Pesquise por nome/isbn'
              }
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pl-5 py-2 w-[500px] rounded-lg bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none shadow-md transition-all duration-200"
            />
          </div>
          {!isExemplarView && (
            <button className="flex items-center bg-white dark:bg-dark-card dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110 shadow-md">
              <span>Filtro Avançado</span>
              <img src={filterIconUrl} alt="Filtros" className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center mr-3 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          <img src={addIconUrl} alt="Adicionar" className="w-6 h-6 mr-2" />
          <span>{isExemplarView ? 'NOVO EXEMPLAR' : 'NOVO LIVRO'}</span>
        </button>
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

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow flex flex-col min-h-0 transition-all duration-200">
        <div className="overflow-y-auto flex-grow bg-white dark:bg-dark-card transition-all duration-200 rounded-t-lg">
          <table className="min-w-full table-auto">
            <thead className="sticky top-0 bg-lumi-primary shadow-md z-10 text-white">
              <tr>
                {isExemplarView ? (
                  <>
                    <SortableTh
                      onClick={() => requestSort('status')}
                      sortConfig={sortConfig}
                      sortKey="status"
                      className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30 w-[15%]"
                    >
                      Status
                    </SortableTh>
                    <SortableTh
                      onClick={() => requestSort('tomboExemplar')}
                      sortConfig={sortConfig}
                      sortKey="tomboExemplar"
                      className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30 w-[20%]"
                    >
                      Tombo
                    </SortableTh>
                    <SortableTh
                      onClick={() => requestSort('localizacao_fisica')}
                      sortConfig={sortConfig}
                      sortKey="localizacao_fisica"
                      className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30 w-[30%]"
                    >
                      Localização
                    </SortableTh>
                    <SortableTh
                      onClick={() => requestSort('responsavel')}
                      sortConfig={sortConfig}
                      sortKey="responsavel"
                      className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30 w-[35%]"
                    >
                      Responsável
                    </SortableTh>
                  </>
                ) : (
                  <>
                    <SortableTh
                      onClick={() => requestSort('isbn')}
                      sortConfig={sortConfig}
                      sortKey="isbn"
                      className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30 w-[15%]"
                    >
                      ISBN
                    </SortableTh>
                    <SortableTh
                      onClick={() => requestSort('nome')}
                      sortConfig={sortConfig}
                      sortKey="nome"
                      className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30 w-[30%]"
                    >
                      Livro
                    </SortableTh>
                    <SortableTh
                      onClick={() => requestSort('autor')}
                      sortConfig={sortConfig}
                      sortKey="autor"
                      className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30 w-[20%]"
                    >
                      Autor
                    </SortableTh>
                    <SortableTh
                      onClick={() => requestSort('editora')}
                      sortConfig={sortConfig}
                      sortKey="editora"
                      className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30 w-[15%]"
                    >
                      Editora
                    </SortableTh>
                    <SortableTh
                      onClick={() => requestSort('quantidade')}
                      sortConfig={sortConfig}
                      sortKey="quantidade"
                      className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30 w-[10%]"
                    >
                      Qtd.
                    </SortableTh>
                    <th className="p-4 text-sm font-bold tracking-wider text-center w-[10%]">
                      Ações
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y text-center bg-white dark:bg-dark-card transition-all duration-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8}>
                    <LoadingIcon />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-8 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : dadosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-gray-500">
                    Nenhum item encontrado.
                  </td>
                </tr>
              ) : (
                dadosPaginados.map((item) => (
                  <tr
                    key={
                      isExemplarView
                        ? (item as ListaLivro).tomboExemplar
                        : (item as LivroAgrupado).isbn
                    }
                    className="transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:duration-0"
                  >
                    {isExemplarView ? (
                      <>
                        <td className="p-4">
                          <StatusIndicator
                            status={(item as ListaLivro).status}
                          />
                        </td>
                        <td className="p-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                          {(item as ListaLivro).tomboExemplar}
                        </td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                          {(item as ListaLivro).localizacao_fisica}
                        </td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                          {(item as ListaLivro).responsavel}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 text-sm font-bold text-black dark:text-white">
                          {item.isbn}
                        </td>
                        <td className="p-4 text-sm font-bold text-black dark:text-white text-center truncate">
                          {item.nome}
                        </td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-300 text-center truncate">
                          {item.autor}
                        </td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-300 text-center truncate">
                          {item.editora}
                        </td>
                        <td className="p-4 text-sm font-bold text-black dark:text-white">
                          {(item as LivroAgrupado).quantidade}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex justify-center items-center gap-x-2">
                            <button
                              onClick={() =>
                                handleVerExemplares(item as LivroAgrupado)
                              }
                              className="bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded hover:bg-blue-600 transition-transform duration-200 hover:scale-110 shadow-md"
                            >
                              EXEMPLARES
                            </button>
                            <button className="bg-lumi-primary text-white text-xs font-bold py-1 px-3 rounded hover:bg-lumi-primary-hover transition-transform duration-200 hover:scale-110 shadow-md">
                              DETALHES
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
