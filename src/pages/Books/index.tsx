import { useState, useEffect, useCallback } from 'react';

import { SortableTh } from '../../components/SortableTh';
import { TableFooter } from '../../components/TableFooter';
import { Modal } from '../../components/Modal';
import { LoadingIcon } from '../../components/LoadingIcon';
import { NovoLivro } from '../../components/forms/NewBook';

import filterIconUrl from '../../assets/icons/filter.svg';
import addIconUrl from '../../assets/icons/add.svg';
import searchIconUrl from '../../assets/icons/search.svg';

import {
  buscarLivrosParaAdmin,
  type ListaLivro,
} from '../../services/livroService';
import type { Page } from '../../types';

const livrosLegend = [
  { label: 'Disponível', color: 'bg-green-500' },
  { label: 'Emprestado', color: 'bg-yellow-500' },
  { label: 'Indisponível', color: 'bg-gray-400' },
];

export function LivrosPage() {
  const [livros, setLivros] = useState<ListaLivro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<Page<ListaLivro> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'nome', direction: 'asc' });

  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLivros = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage - 1,
        size: itemsPerPage,
        sort: `${sortConfig.key},${sortConfig.direction}`,
        texto: filtroAtivo,
      };
      const paginaDeLivros = await buscarLivrosParaAdmin(
        params.texto,
        params.page,
        params.size,
        params.sort,
      );

      setLivros(paginaDeLivros.content);
      setPageData(paginaDeLivros);
    } catch (err) {
      console.error('Erro ao carregar livros:', err);
      setError('Não foi possível carregar os dados dos livros.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, filtroAtivo, sortConfig]);

  useEffect(() => {
    fetchLivros();
  }, [fetchLivros]);

  const handleBusca = () => {
    setCurrentPage(1);
    setFiltroAtivo(termoBusca);
  };

  const requestSort = (key: keyof ListaLivro) => {
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
      INDISPONIVEL: { color: 'bg-gray-400', title: 'Indisponível' }
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative ml-3 mr-2 transition-all duration-200 transform hover:scale-105 select-none">
            <button
              onClick={handleBusca}
              className="absolute inset-y-0 right-0 px-4 rounded-r-lg flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <img src={searchIconUrl} alt="Pesquisar" className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Faça sua pesquisa de aluno"
              className="pl-5 py-2 w-[500px] rounded-lg bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none shadow-md transition-all duration-200"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBusca()}
            />
          </div>
          <button className="flex items-center bg-white dark:bg-dark-card dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110 shadow-md select-none">
            <span>Filtro Avançado</span>
            <img src={filterIconUrl} alt="Filtros" className="w-5 h-5 ml-2" />
          </button>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center mr-3 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-md select-none"
        >
          <img src={addIconUrl} alt="Novo Livro" className="w-6 h-6 mr-2" />
          <span>NOVO LIVRO</span>
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Livro"
      >
        <NovoLivro
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchLivros}
        />
      </Modal>

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow flex flex-col min-h-0 transition-all duration-200">
        <div className="overflow-y-auto flex-grow bg-white dark:bg-dark-card transition-all duration-200 rounded-t-lg">
          <table className="min-w-full table-auto">
            <colgroup>
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '5%' }} />
            </colgroup>
            <thead className="sticky top-0 bg-lumi-primary shadow-md z-10">
              <tr className="select-none">
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider rounded-tl-lg transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('status')}
                  sortConfig={sortConfig}
                  sortKey="status"
                >
                  Status
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('tomboExemplar')}
                  sortConfig={sortConfig}
                  sortKey="tombo"
                >
                  Tombo
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('isbn')}
                  sortConfig={sortConfig}
                  sortKey="isbn"
                >
                  ISBN
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('cdd')}
                  sortConfig={sortConfig}
                  sortKey="cdd"
                >
                  CDD
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('genero')}
                  sortConfig={sortConfig}
                  sortKey="genero"
                >
                  Gênero
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('nome')}
                  sortConfig={sortConfig}
                  sortKey="titulo"
                >
                  Livro
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('autor')}
                  sortConfig={sortConfig}
                  sortKey="autor"
                >
                  Autor
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('editora')}
                  sortConfig={sortConfig}
                  sortKey="editora"
                >
                  Editora
                </SortableTh>
                <th className="p-4 text-sm font-bold text-white tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y text-center bg-white dark:bg-dark-card transition-colors duration-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9}>
                    <LoadingIcon />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="p-8 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : livros.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-gray-500">
                    Nenhum livro encontrado.
                  </td>
                </tr>
              ) : (
                livros.map((item) => (
                  <tr
                    key={item.tomboExemplar}
                    className="transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:duration-0"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <StatusIndicator status={item.status} />
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.tomboExemplar}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-300">
                      {item.isbn}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.cdd}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.genero}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
                      {item.nome}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.autor}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.editora}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <button className="bg-lumi-primary text-white text-xs font-bold py-1 px-3 rounded hover:bg-lumi-primary-hover transition-transform duration-200 hover:scale-110 shadow-md select-none">
                        DETALHES
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TableFooter
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
    </div>
  );
}
