import { useState, useEffect, useMemo } from 'react';
import { StatCard } from '../../components/StatCard';

import bookIconUrl from '../../assets/icons/books.svg';
import usersIconUrl from '../../assets/icons/users.svg';
import authorsIconUrl from '../../assets/icons/authors.svg';
import alertIconUrl from '../../assets/icons/alert.svg';
import settingsIconUrl from '../../assets/icons/settings.svg';

import { getContagemLivros } from '../../services/livroService';
import { getContagemAlunos } from '../../services/alunoService';
import { getContagemAutores } from '../../services/autorService';
import { getContagemAtrasados, buscarEmprestimosAtivos } from '../../services/emprestimoService';

import type { Emprestimo } from '../../types';

interface Stats {
  livros: number;
  alunos: number;
  autores: number;
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

// dados da tabela "Solicitações de Empréstimo" (MOCK)
interface Solicitacao {
  id: number;
  aluno: string;
  livro: string;
  solicitacao: Date;
}

const mockSolicitacoes: Solicitacao[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  aluno: `Neemias Cormino ${i + 1}`,
  livro: `O Senhor dos Anéis Vol. ${i + 1}`,
  solicitacao: new Date(new Date().setDate(new Date().getDate() - (i * 2))), // retroativa a cada 2 dias
}));


export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [solicitacoes] = useState<Solicitacao[]>(mockSolicitacoes);
  const [emprestimos, setEmprestimos] = useState<EmprestimoVencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Solicitacao; direction: 'asc' | 'desc' }>({ key: 'solicitacao', direction: 'asc' });

  const sortedSolicitacoes = useMemo(() => {
    let sortableItems = [...solicitacoes];
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [solicitacoes, sortConfig]);

  const requestSort = (key: keyof Solicitacao) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [contagens, emprestimosAtivos] = await Promise.all([
          Promise.all([
            getContagemLivros(), getContagemAlunos(), getContagemAutores(), getContagemAtrasados()
          ]),
          buscarEmprestimosAtivos()
        ]);

        setStats({
          livros: contagens[0], alunos: contagens[1], autores: contagens[2], atrasados: contagens[3],
        });

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dadosTabela = emprestimosAtivos.map((e: Emprestimo) => {
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

  // renderização
  const getRowClass = (status: EmprestimoVencer['statusVencimento']) => {
    switch (status) {
      case 'vencido': return 'bg-red-100 dark:bg-red-900/50';
      case 'hoje': return 'bg-yellow-100 dark:bg-yellow-700/50';
      default: return 'hover:bg-gray-50 dark:hover:bg-white/5';
    }
  };

  if (isLoading) return <div className="p-4 text-center text-gray-500">Carregando dashboard...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-6 shrink-0">
        <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full mr-4">
          <img src={settingsIconUrl} alt="Ícone de Página" className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Página Inicial</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 shrink-0">
        <StatCard iconUrl={bookIconUrl} title="LIVROS" value={stats?.livros ?? 0} />
        <StatCard iconUrl={usersIconUrl} title="ALUNOS" value={stats?.alunos ?? 0} />
        <StatCard iconUrl={authorsIconUrl} title="AUTORES" value={stats?.autores ?? 0} />
        <StatCard iconUrl={alertIconUrl} title="LIVROS EM ATRASO" value={stats?.atrasados ?? 0} variant="danger" />
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 shrink-0">Solicitações de Empréstimo</h3>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="py-2 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10" onClick={() => requestSort('aluno')}>Aluno</th>
                  <th className="py-2 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10" onClick={() => requestSort('livro')}>Livro</th>
                  <th className="py-2 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10" onClick={() => requestSort('solicitacao')}>Solicitação</th>
                  <th className="py-2 px-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedSolicitacoes.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">{item.aluno}</td>
                    <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">{item.livro}</td>
                    <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">{item.solicitacao.toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-2 text-right">
                      <button className="bg-lumi-primary text-white text-xs font-bold py-1 px-3 rounded hover:bg-lumi-primary-hover">Detalhes</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 shrink-0">Empréstimos a Vencer</h3>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="py-2 px-2">Livro</th>
                  <th className="py-2 px-2">Aluno</th>
                  <th className="py-2 px-2">Devolução</th>
                  <th className="py-2 px-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {emprestimos.map((item) => (
                  <tr key={item.id} className={getRowClass(item.statusVencimento)}>
                    <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">{item.livro}</td>
                    <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">{item.aluno}</td>
                    <td className="py-3 px-2 text-sm font-medium">{item.devolucao}</td>
                    <td className="py-3 px-2 text-right">
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
  );
}