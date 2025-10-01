import { useState, useMemo } from 'react';
import { SortableTh } from '../../components/SortableTh';
import { TableFooter } from '../../components/TableFooter';

import filterIconUrl from '../../assets/icons/filter.svg';
import addIconUrl from '../../assets/icons/add.svg';
import searchIconUrl from '../../assets/icons/search.svg';

type StatusExemplar = 'disponivel' | 'emprestado';

const livrosLegend = [
  { status: 'disponivel', label: 'Disponível', color: 'bg-green-500' },
  { status: 'emprestado', label: 'Emprestado', color: 'bg-yellow-500' },
];

interface Livro {
  id: string;
  status: StatusExemplar;
  tombo: string;
  isbn: string;
  cdd: string;
  genero: string;
  titulo: string;
  autor: string;
  editora: string;
}

const mockLivros: Livro[] = [
  {
    id: '1',
    status: 'disponivel',
    tombo: '001',
    isbn: '9788532530783',
    cdd: '823',
    genero: 'Fantasia',
    titulo: 'Harry Potter e a Pedra Filosofal',
    autor: 'J.K. Rowling',
    editora: 'Rocco',
  },
  {
    id: '2',
    status: 'emprestado',
    tombo: '002',
    isbn: '9788576082377',
    cdd: '005.4',
    genero: 'Técnico',
    titulo: 'Código Limpo',
    autor: 'Robert C. Martin',
    editora: 'Alta Books',
  },
  {
    id: '3',
    status: 'disponivel',
    tombo: '003',
    isbn: '9788594318009',
    cdd: '869.3',
    genero: 'Ficção',
    titulo: 'O Quinze',
    autor: 'Rachel de Queiroz',
    editora: 'José Olympio',
  },
  {
    id: '4',
    status: 'disponivel',
    tombo: '004',
    isbn: '9788535914849',
    cdd: '823',
    genero: 'Ficção Distópica',
    titulo: '1984',
    autor: 'George Orwell',
    editora: 'Companhia das Letras',
  },
  {
    id: '5',
    status: 'emprestado',
    tombo: '005',
    isbn: '9788520933101',
    cdd: '869.3',
    genero: 'Romance',
    titulo: 'Dom Casmurro',
    autor: 'Machado de Assis',
    editora: 'Nova Aguilar',
  },
  {
    id: '6',
    status: 'disponivel',
    tombo: '006',
    isbn: '9788573025025',
    cdd: '869.3',
    genero: 'Romance',
    titulo: 'Capitães da Areia',
    autor: 'Jorge Amado',
    editora: 'Record',
  },
  {
    id: '7',
    status: 'disponivel',
    tombo: '007',
    isbn: '9788535911121',
    cdd: '823',
    genero: 'Fábula',
    titulo: 'A Revolução dos Bichos',
    autor: 'George Orwell',
    editora: 'Companhia das Letras',
  },
  {
    id: '8',
    status: 'emprestado',
    tombo: '008',
    isbn: '9786555321499',
    cdd: '823',
    genero: 'Romance',
    titulo: 'Orgulho e Preconceito',
    autor: 'Jane Austen',
    editora: 'Martin Claret',
  },
  {
    id: '9',
    status: 'disponivel',
    tombo: '009',
    isbn: '9788520937017',
    cdd: '869.3',
    genero: 'Romance',
    titulo: 'Memórias Póstumas de Brás Cubas',
    autor: 'Machado de Assis',
    editora: 'Nova Aguilar',
  },
  {
    id: '10',
    status: 'disponivel',
    tombo: '010',
    isbn: '9788533615540',
    cdd: '823',
    genero: 'Fantasia',
    titulo: 'O Hobbit',
    autor: 'J.R.R. Tolkien',
    editora: 'HarperCollins Brasil',
  },
  {
    id: '11',
    status: 'emprestado',
    tombo: '011',
    isbn: '9788533613379',
    cdd: '823',
    genero: 'Fantasia',
    titulo: 'O Senhor dos Anéis: A Sociedade do Anel',
    autor: 'J.R.R. Tolkien',
    editora: 'HarperCollins Brasil',
  },
  {
    id: '12',
    status: 'disponivel',
    tombo: '012',
    isbn: '9788535923865',
    cdd: '823',
    genero: 'Romance Juvenil',
    titulo: 'A Culpa é das Estrelas',
    autor: 'John Green',
    editora: 'Intrínseca',
  },
  {
    id: '13',
    status: 'disponivel',
    tombo: '013',
    isbn: '9788576653720',
    cdd: '823',
    genero: 'Suspense',
    titulo: 'O Código Da Vinci',
    autor: 'Dan Brown',
    editora: 'Arqueiro',
  },
  {
    id: '14',
    status: 'emprestado',
    tombo: '014',
    isbn: '9788532529787',
    cdd: '823',
    genero: 'Infantil',
    titulo: 'O Pequeno Príncipe',
    autor: 'Antoine de Saint-Exupéry',
    editora: 'Agir',
  },
  {
    id: '15',
    status: 'disponivel',
    tombo: '015',
    isbn: '9788573024011',
    cdd: '869.3',
    genero: 'Romance',
    titulo: 'O Cortiço',
    autor: 'Aluísio Azevedo',
    editora: 'Martin Claret',
  },
  {
    id: '16',
    status: 'disponivel',
    tombo: '016',
    isbn: '9788533613379',
    cdd: '823',
    genero: 'Clássico',
    titulo: 'Moby Dick',
    autor: 'Herman Melville',
    editora: 'Penguin Companhia',
  },
  {
    id: '17',
    status: 'emprestado',
    tombo: '017',
    isbn: '9788501010228',
    cdd: '823',
    genero: 'Terror',
    titulo: 'It - A Coisa',
    autor: 'Stephen King',
    editora: 'Suma',
  },
  {
    id: '18',
    status: 'disponivel',
    tombo: '018',
    isbn: '9788573028453',
    cdd: '823',
    genero: 'Drama',
    titulo: 'A Menina que Roubava Livros',
    autor: 'Markus Zusak',
    editora: 'Intrínseca',
  },
  {
    id: '19',
    status: 'disponivel',
    tombo: '019',
    isbn: '9786555873652',
    cdd: '823',
    genero: 'Fantasia',
    titulo: 'Percy Jackson e o Ladrão de Raios',
    autor: 'Rick Riordan',
    editora: 'Intrínseca',
  },
  {
    id: '20',
    status: 'emprestado',
    tombo: '020',
    isbn: '9788535909555',
    cdd: '823',
    genero: 'Clássico',
    titulo: 'Cem Anos de Solidão',
    autor: 'Gabriel García Márquez',
    editora: 'Record',
  },
];

export function LivrosPage() {
  const [livros] = useState<Livro[]>(mockLivros);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Livro;
    direction: 'asc' | 'desc';
  }>({ key: 'titulo', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedAndSortedLivros = useMemo(() => {
    let sortableItems = [...livros];

    sortableItems.sort((a, b) => {
      const key = sortConfig.key;
      if (a[key] < b[key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortableItems.slice(indexOfFirstItem, indexOfLastItem);
  }, [livros, sortConfig, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(livros.length / itemsPerPage);

  const requestSort = (key: keyof Livro) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const StatusIndicator = ({ status }: { status: StatusExemplar }) => {
    const colorMap = {
      disponivel: 'bg-green-500',
      emprestado: 'bg-yellow-500',
    };
    return (
      <div
        className={`w-3 h-3 rounded-full mx-auto shadow-md ${colorMap[status]}`}
        title={status.toUpperCase()}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative ml-3 mr-2 transition-all duration-200 transform hover:scale-105 select-none">
            <button className="absolute inset-y-0 right-0 px-4 rounded-r-lg flex items-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200">
              <img src={searchIconUrl} alt="Pesquisar" className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Faça sua pesquisa de aluno"
              className="pl-5 py-2 w-[500px] rounded-lg bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none shadow-md transition-all duration-200"
            />
          </div>
          <button className="flex items-center bg-white dark:bg-dark-card dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110 shadow-md select-none">
            <span>Filtro Avançado</span>
            <img src={filterIconUrl} alt="Filtros" className="w-5 h-5 ml-2" />
          </button>
        </div>
        <button className="flex items-center mr-3 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-md select-none">
          <img src={addIconUrl} alt="Novo Livro" className="w-6 h-6 mr-2" />
          <span>NOVO LIVRO</span>
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow flex flex-col min-h-0 transition-all duration-200">
        <div className="overflow-y-auto flex-grow bg-white dark:bg-dark-card transition-all duration-200 rounded-t-lg">
          <table className="min-w-full table-auto">
            <colgroup>
              <col style={{ width: '8%' }} /> {/* Status */}
              <col style={{ width: '8%' }} /> {/* Tombo */}
              <col style={{ width: '14%' }} /> {/* ISBN */}
              <col style={{ width: '8%' }} /> {/* CDD */}
              <col style={{ width: '12%' }} /> {/* Gênero */}
              <col style={{ width: '20%' }} /> {/* Livro */}
              <col style={{ width: '15%' }} /> {/* Autor */}
              <col style={{ width: '10%' }} /> {/* Editora */}
              <col style={{ width: '5%' }} /> {/* Ações */}
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
                  onClick={() => requestSort('tombo')}
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
                  onClick={() => requestSort('titulo')}
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
              {paginatedAndSortedLivros.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:duration-0"
                >
                  <td className="p-4 whitespace-nowrap">
                    <StatusIndicator status={item.status} />
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.tombo}
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
                    {item.titulo}
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
              ))}
            </tbody>
          </table>
        </div>
        <TableFooter
          legendItems={livrosLegend.map((l) => ({
            label: l.label,
            color: l.color,
          }))}
          pagination={{
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: livros.length,
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
