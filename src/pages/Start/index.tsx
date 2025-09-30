import { useState, useEffect, useMemo } from 'react';
import { StatCard } from '../../components/StatCard';
import { SortableTh } from '../../components/SortableTh';
import type { Emprestimo } from '../../types';
import { LoadingIcon } from '../../components/LoadingIcon';

import bookIconUrl from '../../assets/icons/books.svg';
import usersIconUrl from '../../assets/icons/users.svg';
import alertIconUrl from '../../assets/icons/alert.svg';
import loansIconUrl from '../../assets/icons/loans.svg';

import { getContagemLivros } from '../../services/livroService';
import { getContagemAlunos } from '../../services/alunoService';
import {
  getContagemAtrasados,
  getContagemEmprestimosTotais,
  buscarEmprestimosAtivosEAtrasados,
} from '../../services/emprestimoService';

interface Stats {
  livros: number;
  alunos: number;
  emprestimosAtivos: number;
  atrasados: number;
}

interface EmprestimoVencer {
  id: number;
  livro: string;
  isbn: string;
  aluno: string;
  retirada: string;
  devolucao: string;
  statusVencimento: 'atrasado' | 'vence-hoje' | 'ativo';
}

interface Solicitacao {
  // mock
  id: number;
  aluno: string;
  livro: string;
  solicitacao: Date;
}

const mockSolicitacoes: Solicitacao[] = [
  {
    id: 1,
    aluno: 'Neemias Cormino',
    livro: 'Dom Casmurro',
    solicitacao: new Date('2025-09-28'),
  },
  {
    id: 2,
    aluno: 'João Pedro Martins',
    livro: 'O Pequeno Príncipe',
    solicitacao: new Date('2025-09-26'),
  },
  {
    id: 3,
    aluno: 'Maria Clara Fernandes',
    livro: 'Capitães da Areia',
    solicitacao: new Date('2025-09-24'),
  },
  {
    id: 4,
    aluno: 'Carlos Henrique Lima',
    livro: '1984',
    solicitacao: new Date('2025-09-22'),
  },
  {
    id: 5,
    aluno: 'Larissa Costa',
    livro: 'Memórias Póstumas de Brás Cubas',
    solicitacao: new Date('2025-09-20'),
  },
  {
    id: 6,
    aluno: 'Pedro Augusto Nunes',
    livro: 'O Hobbit',
    solicitacao: new Date('2025-09-18'),
  },
  {
    id: 7,
    aluno: 'Fernanda Oliveira',
    livro: 'A Revolução dos Bichos',
    solicitacao: new Date('2025-09-16'),
  },
  {
    id: 8,
    aluno: 'Lucas Almeida',
    livro: 'A Hora da Estrela',
    solicitacao: new Date('2025-09-14'),
  },
  {
    id: 9,
    aluno: 'Juliana Mendes',
    livro: 'O Cortiço',
    solicitacao: new Date('2025-09-12'),
  },
  {
    id: 10,
    aluno: 'Gustavo Ribeiro',
    livro: 'Harry Potter e a Pedra Filosofal',
    solicitacao: new Date('2025-09-10'),
  },
  {
    id: 11,
    aluno: 'Camila Duarte',
    livro: 'Orgulho e Preconceito',
    solicitacao: new Date('2025-09-08'),
  },
  {
    id: 12,
    aluno: 'Thiago Santos',
    livro: 'It - A Coisa',
    solicitacao: new Date('2025-09-06'),
  },
  {
    id: 13,
    aluno: 'Isabela Rocha',
    livro: 'A Menina que Roubava Livros',
    solicitacao: new Date('2025-09-04'),
  },
  {
    id: 14,
    aluno: 'Rafael Souza',
    livro: 'O Código Da Vinci',
    solicitacao: new Date('2025-09-02'),
  },
  {
    id: 15,
    aluno: 'Gabriela Lima',
    livro: 'Moby Dick',
    solicitacao: new Date('2025-08-31'),
  },
];

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [solicitacoes] = useState<Solicitacao[]>(mockSolicitacoes);
  const [emprestimos, setEmprestimos] = useState<EmprestimoVencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [solicitacaoSort, setSolicitacaoSort] = useState<{
    key: keyof Solicitacao;
    direction: 'asc' | 'desc';
  }>({ key: 'solicitacao', direction: 'asc' });
  const [emprestimoSort, setEmprestimoSort] = useState<{
    key: keyof EmprestimoVencer;
    direction: 'asc' | 'desc';
  }>({ key: 'devolucao', direction: 'asc' });

  const sortedSolicitacoes = useMemo(() => {
    let sortableItems = [...solicitacoes];
    sortableItems.sort((a, b) => {
      const key = solicitacaoSort.key;
      if (key === 'solicitacao') {
        // por data (asc = mais antigo primeiro)
        return solicitacaoSort.direction === 'asc'
          ? a.solicitacao.getTime() - b.solicitacao.getTime()
          : b.solicitacao.getTime() - a.solicitacao.getTime();
      } else {
        // alfabética
        if (a[key] < b[key])
          return solicitacaoSort.direction === 'asc' ? -1 : 1;
        if (a[key] > b[key])
          return solicitacaoSort.direction === 'asc' ? 1 : -1;
        return 0;
      }
    });
    return sortableItems;
  }, [solicitacoes, solicitacaoSort]);

  const requestSolicitacaoSort = (key: keyof Solicitacao) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (solicitacaoSort.key === key && solicitacaoSort.direction === 'asc') {
      direction = 'desc';
    }
    setSolicitacaoSort({ key, direction });
  };

  const sortedEmprestimos = useMemo(() => {
    let sortableItems = [...emprestimos];
    sortableItems.sort((a, b) => {
      const key = emprestimoSort.key;
      if (key === 'devolucao') {
        const dateA = new Date(a.devolucao.split('/').reverse().join('-'));
        const dateB = new Date(b.devolucao.split('/').reverse().join('-'));
        // por data (asc = mais antigo primeiro)
        return emprestimoSort.direction === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      // alfabética
      if (a[key] < b[key]) return emprestimoSort.direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return emprestimoSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [emprestimos, emprestimoSort]);

  const requestEmprestimoSort = (key: keyof EmprestimoVencer) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (emprestimoSort.key === key && emprestimoSort.direction === 'asc') {
      direction = 'desc';
    }
    setEmprestimoSort({ key, direction });
  };

  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          contagemLivros,
          contagemAlunos,
          contagemEmprestimos,
          contagemAtrasados,
          listaEmprestimos,
        ] = await Promise.all([
          getContagemLivros(),
          getContagemAlunos(),
          getContagemEmprestimosTotais(),
          getContagemAtrasados(),
          buscarEmprestimosAtivosEAtrasados(),
        ]);

        setStats({
          livros: contagemLivros,
          alunos: contagemAlunos,
          emprestimosAtivos: contagemEmprestimos,
          atrasados: contagemAtrasados,
        });

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dadosTabela = listaEmprestimos.map((e: Emprestimo) => {
          const dataDevolucao = new Date(e.dataDevolucao);
          dataDevolucao.setHours(0, 0, 0, 0);

          let statusVencimento: EmprestimoVencer['statusVencimento'] = 'ativo';
          if (dataDevolucao < hoje) statusVencimento = 'atrasado';
          else if (dataDevolucao.getTime() === hoje.getTime())
            statusVencimento = 'vence-hoje';

          return {
            id: e.id,
            livro: e.exemplar?.livro?.nome || 'Livro não encontrado',
            isbn: e.exemplar?.livro?.isbn || 'N/A',
            aluno: `${e.aluno?.nome || ''} ${e.aluno?.sobrenome || ''}`.trim(),
            retirada: new Date(e.dataEmprestimo).toLocaleDateString('pt-BR'),
            devolucao: new Date(e.dataDevolucao).toLocaleDateString('pt-BR'),
            statusVencimento,
          };
        });
        setEmprestimos(dadosTabela);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError(
          'Não foi possível carregar os dados. Verifique a conexão com a API.',
        );
      } finally {
        setIsLoading(false);
      }
    };
    carregarDados();
  }, []);

  const getRowClass = (status: EmprestimoVencer['statusVencimento']) => {
    const baseHover = 'transition-colors duration-200 hover:duration-0';
    switch (status) {
      case 'atrasado':
        return `bg-red-500/30 dark:bg-red-500/30 hover:bg-red-500/40 dark:hover:bg-red-500/40 ${baseHover}`;
      case 'vence-hoje':
        return `bg-yellow-300/25 dark:bg-yellow-300/25 hover:bg-yellow-300/40 dark:hover:bg-yellow-300/35 ${baseHover}`;
      case 'ativo':
      default:
        return `hover:bg-gray-300 dark:hover:bg-gray-600 ${baseHover}`;
    }
  };

  if (isLoading) return <LoadingIcon />;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 shrink-0">
        <StatCard
          to="/livros"
          iconUrl={bookIconUrl}
          title="LIVROS"
          value={stats?.livros ?? 0}
        />
        <StatCard
          to="/alunos"
          iconUrl={usersIconUrl}
          title="ALUNOS"
          value={stats?.alunos ?? 0}
        />
        <StatCard
          to="/emprestimos"
          iconUrl={loansIconUrl}
          title="EMPRÉSTIMOS"
          value={stats?.emprestimosAtivos ?? 0}
        />
        <StatCard
          to="/emprestimos"
          iconUrl={alertIconUrl}
          title="PENDÊNCIAS"
          value={stats?.atrasados ?? 0}
          variant="danger"
        />
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/*Solicitações de Empréstimo*/}
        <div className="bg-white dark:bg-dark-card transition-colors duration-200 p-6 rounded-lg shadow-md flex flex-col min-h-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 shrink-0 select-none">
            Solicitações de Empréstimo
          </h3>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-center table-fixed">
              <colgroup>
                <col style={{ width: '25%' }} /> {/* Aluno */}
                <col style={{ width: '30%' }} /> {/* Livro */}
                <col style={{ width: '25%' }} /> {/* Solicitação */}
                <col style={{ width: '20%' }} /> {/* Ações */}
              </colgroup>
              <thead className="sticky top-0 bg-white dark:bg-dark-card transition-colors duration-200 shadow-md dark:shadow-sm dark:shadow-white z-20">
                <tr className="select-none">
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 w-2/5 transition-all duration-200"
                    onClick={() => requestSolicitacaoSort('aluno')}
                    sortConfig={solicitacaoSort}
                    sortKey="aluno"
                  >
                    Aluno
                  </SortableTh>
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 w-2/5 transition-all duration-200"
                    onClick={() => requestSolicitacaoSort('livro')}
                    sortConfig={solicitacaoSort}
                    sortKey="livro"
                  >
                    Livro
                  </SortableTh>
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 w-1/5 transition-all duration-200"
                    onClick={() => requestSolicitacaoSort('solicitacao')}
                    sortConfig={solicitacaoSort}
                    sortKey="solicitacao"
                  >
                    Solicitação
                  </SortableTh>
                  <th className="py-2 px-2 text-sm font-bold text-gray-800 dark:text-white">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white dark:bg-dark-card transition-colors duration-200">
                {sortedSolicitacoes.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:duration-0"
                  >
                    <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.aluno}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.livro}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-700 dark:text-white font-bold">
                      {item.solicitacao.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-2">
                      <button className="bg-lumi-primary text-white text-xs font-bold py-1 px-3 rounded hover:bg-lumi-primary-hover transition-transform duration-200 hover:scale-110 shadow-md select-none">
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/*Empréstimos Ativos*/}
        <div className="bg-white dark:bg-dark-card transition-colors duration-200 p-6 rounded-lg shadow-md flex flex-col min-h-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 shrink-0 select-none">
            Empréstimos Ativos
          </h3>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-center table-fixed">
              <colgroup>
                <col style={{ width: '30%' }} /> {/* Livro */}
                <col style={{ width: '30%' }} /> {/* Aluno */}
                <col style={{ width: '20%' }} /> {/* Devolução */}
                <col style={{ width: '15%' }} /> {/* Ações */}
              </colgroup>
              <thead className="sticky top-0 bg-white dark:bg-dark-card transition-colors duration-200 shadow-md dark:shadow-sm dark:shadow-white z-20">
                <tr className="select-none">
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    onClick={() => requestEmprestimoSort('livro')}
                    sortConfig={emprestimoSort}
                    sortKey="livro"
                  >
                    Livro
                  </SortableTh>
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    onClick={() => requestEmprestimoSort('aluno')}
                    sortConfig={emprestimoSort}
                    sortKey="aluno"
                  >
                    Aluno
                  </SortableTh>
                  <SortableTh
                    className="text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    onClick={() => requestEmprestimoSort('devolucao')}
                    sortConfig={emprestimoSort}
                    sortKey="devolucao"
                  >
                    Devolução
                  </SortableTh>
                  <th className="py-2 px-2 text-sm font-bold text-gray-800 dark:text-white">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white dark:bg-dark-card transition-colors duration-200">
                {sortedEmprestimos.map((item) => (
                  <tr
                    key={item.id}
                    className={getRowClass(item.statusVencimento)}
                  >
                    <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.livro}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.aluno}
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-700 dark:text-white">
                      {item.devolucao}
                    </td>
                    <td className="py-3 px-2">
                      <button className="bg-lumi-primary text-white text-xs font-bold py-1 px-3 rounded hover:bg-lumi-primary-hover transition-transform duration-200 hover:scale-110 shadow-md select-none">
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
