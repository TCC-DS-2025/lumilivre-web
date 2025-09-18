import { useState, useMemo } from 'react';
import { SortableTh } from '../../components/SortableTh';

import filterIconUrl from '../../assets/icons/filter.svg';
import addIconUrl from '../../assets/icons/add.svg';
import searchIconUrl from '../../assets/icons/search.svg';

type StatusEmprestimo = 'ativo' | 'atrasado' | 'vence-hoje' | 'concluido';

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
  // mock
  {
    id: 1,
    status: 'ativo',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date('2025-10-25'),
  },
  {
    id: 2,
    status: 'atrasado',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date('2025-03-04'),
  },
  {
    id: 3,
    status: 'vence-hoje',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date(),
  },
  {
    id: 4,
    status: 'concluido',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date('2025-03-04'),
  },
  {
    id: 5,
    status: 'ativo',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date('2025-10-25'),
  },
  {
    id: 6,
    status: 'atrasado',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date('2025-03-04'),
  },
  {
    id: 7,
    status: 'vence-hoje',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date(),
  },
  {
    id: 8,
    status: 'concluido',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date('2025-03-04'),
  },
  {
    id: 9,
    status: 'ativo',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date('2025-10-25'),
  },
  {
    id: 10,
    status: 'atrasado',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date('2025-03-04'),
  },
  {
    id: 11,
    status: 'vence-hoje',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date(),
  },
  {
    id: 12,
    status: 'concluido',
    livro: 'O Pequeno Príncipe',
    tombo: '978327323207',
    aluno: 'Clodoaldo da Silva',
    curso: 'Desenvolvimento de Sistemas',
    emprestimo: new Date('2025-03-15'),
    devolucao: new Date('2025-03-04'),
  },
];

export function EmprestimosPage() {
  const [emprestimos] = useState<Emprestimo[]>(mockEmprestimos);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Emprestimo;
    direction: 'asc' | 'desc';
  }>({ key: 'devolucao', direction: 'asc' });

  const sortedEmprestimos = useMemo(() => {
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
    return sortableItems;
  }, [emprestimos, sortConfig]);

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
        className={`w-3 h-3 rounded-full mx-auto ${colorMap[status]}`}
        title={status.replace('-', ' ').toUpperCase()}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative ml-3 mr-2 transition-all duration-200 transform hover:scale-105 select-none">
            <input
              type="text"
              placeholder="Faça sua pesquisa de empréstimo"
              className="pl-10 pr-4 py-2 w-[500px] rounded-lg bg-white dark:bg-dark-card dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none shadow-md transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <img
                src={searchIconUrl}
                alt="Pesquisar"
                className="w-5 h-5 text-gray-400"
              />
            </div>
          </div>
          <button className="flex items-center bg-white dark:bg-dark-card dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110 shadow-md select-none">
            <img src={filterIconUrl} alt="Filtros" className="w-5 h-5 mr-2" />
            <span>Filtro Avançado</span>
          </button>
        </div>
        <button className="flex items-center mr-3 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-md select-none">
          <img
            src={addIconUrl}
            alt="Novo Empréstimo"
            className="w-6 h-6 mr-2"
          />
          <span>NOVO EMPRÉSTIMO</span>
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow flex flex-col min-h-0">
        <div className="overflow-y-auto bg-white dark:bg-dark-card transition-colors duration-200 rounded-lg">
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
                  className="p-4 text-sm font-bold text-white tracking-wider rounded-tl-lg transition-all duration-200 hover:bg-white/20"
                  onClick={() => requestSort('status')}
                  sortConfig={sortConfig}
                  sortKey="status"
                >
                  Status
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/20"
                  onClick={() => requestSort('livro')}
                  sortConfig={sortConfig}
                  sortKey="livro"
                >
                  Livro
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/20"
                  onClick={() => requestSort('tombo')}
                  sortConfig={sortConfig}
                  sortKey="tombo"
                >
                  Tombo
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/20"
                  onClick={() => requestSort('aluno')}
                  sortConfig={sortConfig}
                  sortKey="aluno"
                >
                  Aluno
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/20"
                  onClick={() => requestSort('curso')}
                  sortConfig={sortConfig}
                  sortKey="curso"
                >
                  Curso
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/20"
                  onClick={() => requestSort('emprestimo')}
                  sortConfig={sortConfig}
                  sortKey="emprestimo"
                >
                  Empréstimo
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/20"
                  onClick={() => requestSort('devolucao')}
                  sortConfig={sortConfig}
                  sortKey="devolucao"
                >
                  Devolução
                </SortableTh>
                <th className="p-4 text-sm font-bold text-white tracking-wider rounded-tr-lg">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y text-center bg-white dark:bg-dark-card transition-colors duration-200">
              {sortedEmprestimos.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:duration-0"
                >
                  <td className="p-4 whitespace-nowrap">
                    <StatusIndicator status={item.status} />
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate">
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
      </div>
    </div>
  );
}
