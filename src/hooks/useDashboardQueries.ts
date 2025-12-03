import { useQuery } from '@tanstack/react-query';

import { getContagemLivros } from '../services/livroService';
import { getContagemAlunos } from '../services/alunoService';
import {
  getContagemEmprestimosTotais,
  getContagemAtrasados,
  buscarEmprestimosAtivosEAtrasados,
} from '../services/emprestimoService';
import { buscarSolicitacoesPendentes } from '../services/solicitacaoEmprestimoService';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [livros, alunos, emprestimosAtivos, atrasados] = await Promise.all([
        getContagemLivros(),
        getContagemAlunos(),
        getContagemEmprestimosTotais(),
        getContagemAtrasados(),
      ]);
      return { livros, alunos, emprestimosAtivos, atrasados };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useDashboardListas() {
  const solicitacoes = useQuery({
    queryKey: ['dashboard-solicitacoes'],
    queryFn: buscarSolicitacoesPendentes,
    staleTime: 1000 * 60 * 1, // 1 minuto
  });

  const emprestimos = useQuery({
    queryKey: ['dashboard-emprestimos-lista'],
    queryFn: buscarEmprestimosAtivosEAtrasados,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  return { solicitacoes, emprestimos };
}
