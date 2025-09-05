import { useState, useEffect, useMemo } from 'react';
import { StatCard } from '../../components/StatCard';
import { SortableTh } from '../../components/SortableTh'; 
import type { Emprestimo } from '../../types';

import bookIconUrl from '../../assets/icons/books.svg';
import usersIconUrl from '../../assets/icons/users.svg';
import alertIconUrl from '../../assets/icons/alert.svg';
import loansIconUrl from '../../assets/icons/loans.svg';

import { getContagemLivros } from '../../services/livroService';
import { getContagemAlunos } from '../../services/alunoService';
import { getContagemAtrasados, getContagemEmprestimosTotais, buscarEmprestimosAtivosEAtrasados } from '../../services/emprestimoService';

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
  statusVencimento: 'vencido' | 'hoje' | 'no-prazo';
}

interface Solicitacao { // mock
  id: number;
  aluno: string;
  livro: string;
  solicitacao: Date;
}

const mockSolicitacoes: Solicitacao[] = Array.from({ length: 15 }, (_, i) => ({ // mock
  id: i + 1,
  aluno: `Neemias Cormino ${i + 1}`,
  livro: `O Senhor dos Anéis Vol. ${i + 1}`,
  solicitacao: new Date(new Date().setDate(new Date().getDate() - (i * 2))),
})); 

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [solicitacoes] = useState<Solicitacao[]>(mockSolicitacoes);
  const [emprestimos, setEmprestimos] = useState<EmprestimoVencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [solicitacaoSort, setSolicitacaoSort] = useState<{ key: keyof Solicitacao; direction: 'asc' | 'desc' }>({ key: 'solicitacao', direction: 'asc' });
  const [emprestimoSort, setEmprestimoSort] = useState<{ key: keyof EmprestimoVencer; direction: 'asc' | 'desc' }>({ key: 'devolucao', direction: 'asc' });

  const sortedSolicitacoes = useMemo(() => {
    let sortableItems = [...solicitacoes];
    sortableItems.sort((a, b) => {
      const key = solicitacaoSort.key;
      if (key === 'solicitacao') {
        // por data (asc = mais antigo primeiro)
        return solicitacaoSort.direction === 'asc' ? a.solicitacao.getTime() - b.solicitacao.getTime() : b.solicitacao.getTime() - a.solicitacao.getTime();
      } else {
        // alfabética
        if (a[key] < b[key]) return solicitacaoSort.direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return solicitacaoSort.direction === 'asc' ? 1 : -1;
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
        return emprestimoSort.direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
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
        const [contagemLivros, contagemAlunos, contagemEmprestimos, contagemAtrasados, listaEmprestimos] = await Promise.all([
            getContagemLivros(), 
            getContagemAlunos(), 
            getContagemEmprestimosTotais(), 
            getContagemAtrasados(),      
            buscarEmprestimosAtivosEAtrasados() 
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
          
          let statusVencimento: EmprestimoVencer['statusVencimento'] = 'no-prazo';
          if (dataDevolucao < hoje) statusVencimento = 'vencido';
          else if (dataDevolucao.getTime() === hoje.getTime()) statusVencimento = 'hoje';

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
        console.error("Erro ao carregar dados do dashboard:", err);
        setError("Não foi possível carregar os dados. Verifique a conexão com a API.");
      } finally {
        setIsLoading(false);
      }
    };
    carregarDados();
  }, []);

  const getRowClass = (status: EmprestimoVencer['statusVencimento']) => {
    const baseHover = 'hover:bg-gray-100/50 dark:hover:bg-white/10'; 
    switch (status) {
      case 'vencido': return `bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 ${baseHover}`;
      case 'hoje': return `bg-yellow-100 dark:bg-yellow-700/40 text-yellow-800 dark:text-yellow-200 ${baseHover}`;
      default: return `hover:bg-gray-50 dark:hover:bg-gray-700/50`;
    }
  };

  if (isLoading) return <div className="p-4 text-center text-gray-500 dark:text-gray-300">Carregando dashboard...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 shrink-0">
        <StatCard iconUrl={bookIconUrl} title="LIVROS" value={stats?.livros ?? 0} />
        <StatCard iconUrl={usersIconUrl} title="ALUNOS" value={stats?.alunos ?? 0} />
        <StatCard iconUrl={loansIconUrl} title="EMPRÉSTIMOS" value={stats?.emprestimosAtivos ?? 0} />
        <StatCard iconUrl={alertIconUrl} title="PENDÊNCIAS" value={stats?.atrasados ?? 0} variant="danger" />
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Solicitações de Empréstimo */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md flex flex-col min-h-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 shrink-0">Solicitações de Empréstimo</h3>
          <div className="flex flex-col overflow-hidden flex-grow">
            <table className="w-full text-center">
              <thead className="bg-white dark:bg-dark-card">
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <SortableTh className="text-sm font-bold text-gray-800 dark:text-white" onClick={() => requestSolicitacaoSort('aluno')} sortConfig={solicitacaoSort} sortKey="aluno">Aluno</SortableTh>
                  <SortableTh className="text-sm font-bold text-gray-800 dark:text-white" onClick={() => requestSolicitacaoSort('livro')} sortConfig={solicitacaoSort} sortKey="livro">Livro</SortableTh>
                  <SortableTh className="text-sm font-bold text-gray-800 dark:text-white" onClick={() => requestSolicitacaoSort('solicitacao')} sortConfig={solicitacaoSort} sortKey="solicitacao">Solicitação</SortableTh>
                  <th className="py-2 px-2 text-sm font-bold text-gray-800 dark:text-white">Ações</th>
                </tr>
              </thead>
            </table>
            <div className="overflow-y-auto">
              <table className="w-full text-center">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedSolicitacoes.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">{item.aluno}</td>
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">{item.livro}</td>
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-white font-bold">{item.solicitacao.toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-2">
                        <button className="bg-lumi-primary text-white text-xs font-bold py-1 px-3 rounded hover:bg-lumi-primary-hover">Detalhes</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Empréstimos Ativos */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md flex flex-col min-h-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 shrink-0">Empréstimos Ativos</h3>
          <div className="flex flex-col overflow-hidden flex-grow">
            <table className="w-full text-center">
              <thead className="bg-white dark:bg-dark-card">
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <SortableTh className="text-sm font-bold text-gray-800 dark:text-white" onClick={() => requestEmprestimoSort('livro')} sortConfig={emprestimoSort} sortKey="livro">Livro</SortableTh>
                  <SortableTh className="text-sm font-bold text-gray-800 dark:text-white" onClick={() => requestEmprestimoSort('aluno')} sortConfig={emprestimoSort} sortKey="aluno">Aluno</SortableTh>
                  <SortableTh className="text-sm font-bold text-gray-800 dark:text-white" onClick={() => requestEmprestimoSort('devolucao')} sortConfig={emprestimoSort} sortKey="devolucao">Devolução</SortableTh>
                  <th className="py-2 px-2 text-sm font-bold text-gray-800 dark:text-white">Ações</th>
                </tr>
              </thead>
            </table>
            <div className="overflow-y-auto">
              <table className="w-full text-center">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedEmprestimos.map((item) => (
                    <tr key={item.id} className={getRowClass(item.statusVencimento)}>
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-white">{item.livro}</td>
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-white">{item.aluno}</td>
                      <td className="py-3 px-2 text-sm font-medium dark:text-white">{item.devolucao}</td>
                      <td className="py-3 px-2">
                        <button className="bg-lumi-primary text-white text-xs font-bold py-1 px-3 rounded hover:bg-lumi-primary-hover">Detalhes</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}