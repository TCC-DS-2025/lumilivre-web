import { useState, useMemo } from 'react';

import { ActionHeader } from '../../components/ActionHeader';
import { SortableTh } from '../../components/SortableTh';
import { TableFooter } from '../../components/TableFooter';

type StatusEmprestimo = 'ativo' | 'atrasado' | 'vence-hoje' | 'concluido';

const emprestimosLegend = [
  { status: 'ativo', label: 'Ativo', color: 'bg-green-500' },
  { status: 'vence-hoje', label: 'Vence Hoje', color: 'bg-yellow-500' },
  { status: 'atrasado', label: 'Atrasado', color: 'bg-red-500' },
  { status: 'concluido', label: 'Concluído', color: 'bg-gray-400' },
];

interface Emprestimo {
  id: number;
  status: StatusEmprestimo;
  livro: string;
  tombo: string;
  aluno: string;
  curso: string;
  emprestimo: Date;
  devolucao: Date;
}

const mockEmprestimos: Emprestimo[] = [
  {
    id: 1,
    status: 'ativo',
    livro: 'Dom Casmurro',
    tombo: '978000000001',
    aluno: 'Ana Beatriz Souza',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-10'),
    devolucao: new Date('2025-10-20'),
  },
  {
    id: 2,
    status: 'atrasado',
    livro: 'O Pequeno Príncipe',
    tombo: '978000000002',
    aluno: 'João Pedro Martins',
    curso: 'Enfermagem',
    emprestimo: new Date('2025-02-15'),
    devolucao: new Date('2025-03-01'),
  },
  {
    id: 3,
    status: 'vence-hoje',
    livro: 'Capitães da Areia',
    tombo: '978000000003',
    aluno: 'Maria Clara Fernandes',
    curso: 'Administração',
    emprestimo: new Date('2025-09-20'),
    devolucao: new Date(),
  },
  {
    id: 4,
    status: 'concluido',
    livro: '1984',
    tombo: '978000000004',
    aluno: 'Carlos Henrique Lima',
    curso: 'Logística',
    emprestimo: new Date('2025-01-05'),
    devolucao: new Date('2025-02-05'),
  },
  {
    id: 5,
    status: 'ativo',
    livro: 'Memórias Póstumas de Brás Cubas',
    tombo: '978000000005',
    aluno: 'Larissa Costa',
    curso: 'Contabilidade',
    emprestimo: new Date('2025-06-12'),
    devolucao: new Date('2025-11-15'),
  },
  {
    id: 6,
    status: 'atrasado',
    livro: 'O Hobbit',
    tombo: '978000000006',
    aluno: 'Pedro Augusto Nunes',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-04-10'),
    devolucao: new Date('2025-05-01'),
  },
  {
    id: 7,
    status: 'vence-hoje',
    livro: 'A Revolução dos Bichos',
    tombo: '978000000007',
    aluno: 'Fernanda Oliveira',
    curso: 'Enfermagem',
    emprestimo: new Date('2025-09-15'),
    devolucao: new Date(),
  },
  {
    id: 8,
    status: 'concluido',
    livro: 'A Hora da Estrela',
    tombo: '978000000008',
    aluno: 'Lucas Almeida',
    curso: 'Administração',
    emprestimo: new Date('2025-02-20'),
    devolucao: new Date('2025-03-10'),
  },
  {
    id: 9,
    status: 'ativo',
    livro: 'O Cortiço',
    tombo: '978000000009',
    aluno: 'Juliana Mendes',
    curso: 'Logística',
    emprestimo: new Date('2025-08-01'),
    devolucao: new Date('2025-11-01'),
  },
  {
    id: 10,
    status: 'atrasado',
    livro: 'Harry Potter e a Pedra Filosofal',
    tombo: '978000000010',
    aluno: 'Gustavo Ribeiro',
    curso: 'Contabilidade',
    emprestimo: new Date('2025-03-01'),
    devolucao: new Date('2025-04-01'),
  },
  {
    id: 11,
    status: 'vence-hoje',
    livro: 'Orgulho e Preconceito',
    tombo: '978000000011',
    aluno: 'Camila Duarte',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-09-18'),
    devolucao: new Date(),
  },
  {
    id: 12,
    status: 'concluido',
    livro: 'It - A Coisa',
    tombo: '978000000012',
    aluno: 'Thiago Santos',
    curso: 'Enfermagem',
    emprestimo: new Date('2025-01-10'),
    devolucao: new Date('2025-02-12'),
  },
  {
    id: 13,
    status: 'ativo',
    livro: 'A Menina que Roubava Livros',
    tombo: '978000000013',
    aluno: 'Isabela Rocha',
    curso: 'Administração',
    emprestimo: new Date('2025-07-15'),
    devolucao: new Date('2025-10-15'),
  },
  {
    id: 14,
    status: 'atrasado',
    livro: 'O Código Da Vinci',
    tombo: '978000000014',
    aluno: 'Rafael Souza',
    curso: 'Logística',
    emprestimo: new Date('2025-04-05'),
    devolucao: new Date('2025-05-01'),
  },
  {
    id: 15,
    status: 'vence-hoje',
    livro: 'Moby Dick',
    tombo: '978000000015',
    aluno: 'Gabriela Lima',
    curso: 'Contabilidade',
    emprestimo: new Date('2025-09-21'),
    devolucao: new Date(),
  },
  {
    id: 16,
    status: 'concluido',
    livro: 'Grande Sertão: Veredas',
    tombo: '978000000016',
    aluno: 'Leonardo Pires',
    curso: 'Administração',
    emprestimo: new Date('2025-01-15'),
    devolucao: new Date('2025-02-15'),
  },
  {
    id: 17,
    status: 'ativo',
    livro: 'Senhora',
    tombo: '978000000017',
    aluno: 'Patrícia Almeida',
    curso: 'Enfermagem',
    emprestimo: new Date('2025-08-20'),
    devolucao: new Date('2025-11-30'),
  },
  {
    id: 18,
    status: 'atrasado',
    livro: 'O Alienista',
    tombo: '978000000018',
    aluno: 'Rodrigo Santos',
    curso: 'Logística',
    emprestimo: new Date('2025-03-05'),
    devolucao: new Date('2025-04-01'),
  },
  {
    id: 19,
    status: 'vence-hoje',
    livro: 'Frankenstein',
    tombo: '978000000019',
    aluno: 'Beatriz Moraes',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-09-22'),
    devolucao: new Date(),
  },
  {
    id: 20,
    status: 'concluido',
    livro: 'O Alquimista',
    tombo: '978000000020',
    aluno: 'André Lopes',
    curso: 'Contabilidade',
    emprestimo: new Date('2025-02-01'),
    devolucao: new Date('2025-03-01'),
  },
];

export function EmprestimosPage() {
  const [emprestimos] = useState<Emprestimo[]>(mockEmprestimos);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Emprestimo;
    direction: 'asc' | 'desc';
  }>({ key: 'devolucao', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [termoBusca, setTermoBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const paginatedAndSortedEmprestimos = useMemo(() => {
    let sortableItems = [...emprestimos];

    sortableItems.sort((a, b) => {
      const key = sortConfig.key;
      if (key === 'emprestimo' || key === 'devolucao') {
        return sortConfig.direction === 'asc'
          ? a[key].getTime() - b[key].getTime()
          : b[key].getTime() - a[key].getTime();
      }
      if (a[key] < b[key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortableItems.slice(indexOfFirstItem, indexOfLastItem);
  }, [emprestimos, sortConfig, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(emprestimos.length / itemsPerPage);

  const requestSort = (key: keyof Emprestimo) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const StatusIndicator = ({ status }: { status: StatusEmprestimo }) => {
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

  const getRowClass = (status: StatusEmprestimo) => {
    const baseHover = 'transition-colors duration-200 hover:duration-0';
    switch (status) {
      case 'atrasado':
        return `bg-red-500/30 dark:bg-red-500/30 hover:bg-red-500/60 dark:hover:bg-red-500/60 ${baseHover}`;
      case 'vence-hoje':
        return `bg-yellow-300/25 dark:bg-yellow-300/25 hover:bg-yellow-300/55 dark:hover:bg-yellow-300/50 ${baseHover}`;
      case 'ativo':
      case 'concluido':
      default:
        return `hover:bg-gray-300 dark:hover:bg-gray-600 ${baseHover}`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ActionHeader
        searchTerm={termoBusca}
        onSearchChange={setTermoBusca}
        onSearchSubmit={() => {
          alert('Funcionalidade de busca a ser implementada.');
        }}
        searchPlaceholder="Faça sua pesquisa de aluno"
        onAddNew={() => setIsModalOpen(true)}
        addNewButtonLabel="NOVO EMPRÉSTIMO"
        showFilterButton={true}
        onFilterToggle={() => {
          alert('Funcionalidade de filtro avançado a ser implementada.');
        }}
      />

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow flex flex-col min-h-0 transition-all duration-200">
        <div className="overflow-y-auto flex-grow bg-white dark:bg-dark-card transition-all duration-200 rounded-t-lg">
          <table className="min-w-full table-auto">
            <colgroup>
              <col style={{ width: '8%' }} /> {/* Status */}
              <col style={{ width: '20%' }} /> {/* Livro */}
              <col style={{ width: '11%' }} /> {/* Tombo */}
              <col style={{ width: '20%' }} /> {/* Aluno */}
              <col style={{ width: '15%' }} /> {/* Curso */}
              <col style={{ width: '11%' }} /> {/* Empréstimo */}
              <col style={{ width: '10%' }} /> {/* Devolução */}
              <col style={{ width: '5%' }} /> {/* Ações */}
            </colgroup>
            <thead className="sticky top-0 bg-lumi-primary shadow-md z-10">
              <tr className="select-none">
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('status')}
                  sortConfig={sortConfig}
                  sortKey="status"
                >
                  Status
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('livro')}
                  sortConfig={sortConfig}
                  sortKey="livro"
                >
                  Livro
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
                  onClick={() => requestSort('aluno')}
                  sortConfig={sortConfig}
                  sortKey="aluno"
                >
                  Aluno
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('curso')}
                  sortConfig={sortConfig}
                  sortKey="curso"
                >
                  Curso
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('emprestimo')}
                  sortConfig={sortConfig}
                  sortKey="emprestimo"
                >
                  Empréstimo
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('devolucao')}
                  sortConfig={sortConfig}
                  sortKey="devolucao"
                >
                  Devolução
                </SortableTh>
                <th className="p-4 text-sm font-bold text-white tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y text-center bg-white dark:bg-dark-card transition-all duration-200">
              {paginatedAndSortedEmprestimos.map((item) => (
                <tr key={item.id} className={getRowClass(item.status)}>
                  <td className="p-4 whitespace-nowrap">
                    <StatusIndicator status={item.status} />
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
                    {item.livro}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.tombo}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate">
                    {item.aluno}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate">
                    {item.curso}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-300">
                    {item.emprestimo.toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-300">
                    {item.devolucao.toLocaleDateString('pt-BR')}
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
          legendItems={emprestimosLegend.map((l) => ({
            label: l.label,
            color: l.color,
          }))}
          pagination={{
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: emprestimos.length,
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
