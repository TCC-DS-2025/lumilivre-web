import { useQuery, keepPreviousData } from '@tanstack/react-query';

import {
  buscarLivrosAgrupados,
  buscarLivrosAvancado,
  type LivroFilterParams,
} from '../services/livroService';

import { buscarExemplaresPorLivroId } from '../services/exemplarService';

import {
  buscarAlunosParaAdmin,
  buscarAlunosAvancado,
} from '../services/alunoService';

import {
  buscarEmprestimosPaginado,
  buscarEmprestimosAvancado,
  buscarEmprestimosAtivosEAtrasados,
  buscarRanking,
  type EmprestimoFilterParams,
} from '../services/emprestimoService';

// --- TIPOS AUXILIARES ---

interface AlunoFilterParams {
  penalidade?: string;
  matricula?: string;
  nome?: string;
  cursoNome?: string;
  turnoId?: number;
  moduloId?: number;
  dataNascimento?: string;
  email?: string;
  celular?: string;
}

// --- HOOKS DE LIVROS ---

export function useLivros(
  page: number,
  size: number,
  sort: string,
  termoBusca: string,
  filtrosAvancados: LivroFilterParams,
) {
  return useQuery({
    queryKey: ['livros', page, size, sort, termoBusca, filtrosAvancados],
    queryFn: () => {
      const temFiltroAvancado = Object.values(filtrosAvancados).some(
        (val) => val !== '' && val !== null && val !== undefined,
      );

      if (temFiltroAvancado) {
        return buscarLivrosAvancado({
          ...filtrosAvancados,
          page,
          size,
          sort,
        });
      }

      return buscarLivrosAgrupados(termoBusca, page, size, sort);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useExemplares(livroId: number | null) {
  return useQuery({
    queryKey: ['exemplares', livroId],
    queryFn: () => buscarExemplaresPorLivroId(livroId!),
    enabled: !!livroId,
    staleTime: 1000 * 30, // 30 segundos
  });
}

// --- HOOKS DE ALUNOS ---

export function useAlunos(
  page: number,
  size: number,
  sort: string,
  termoBusca: string,
  filtrosAvancados: AlunoFilterParams,
) {
  return useQuery({
    queryKey: ['alunos', page, size, sort, termoBusca, filtrosAvancados],
    queryFn: () => {
      const temFiltroAvancado = Object.values(filtrosAvancados).some(
        (val) => val !== '' && val !== null && val !== undefined,
      );

      if (temFiltroAvancado) {
        return buscarAlunosAvancado({
          ...filtrosAvancados,
          page,
          size,
          sort,
        });
      }

      return buscarAlunosParaAdmin(termoBusca, page, size, sort);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// --- HOOKS DE EMPRÉSTIMOS ---

export function useEmprestimos(
  page: number,
  size: number,
  sort: string,
  termoBusca: string,
  filtrosAvancados: EmprestimoFilterParams,
) {
  return useQuery({
    queryKey: ['emprestimos', page, size, sort, termoBusca, filtrosAvancados],
    queryFn: () => {
      const temFiltroAvancado = Object.values(filtrosAvancados).some(
        (val) => val !== '' && val !== null && val !== undefined,
      );

      if (temFiltroAvancado) {
        return buscarEmprestimosAvancado({
          ...filtrosAvancados,
          page,
          size,
          sort,
        });
      }

      return buscarEmprestimosPaginado(termoBusca, page, size, sort);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 1, // 1 minuto
  });
}

export function useEmprestimosAtivosEAtrasados() {
  return useQuery({
    queryKey: ['emprestimos-ativos-atrasados'],
    queryFn: buscarEmprestimosAtivosEAtrasados,
    staleTime: 1000 * 60 * 2, // 2 minuto
  });
}

// --- HOOKS DE RANKING ---

export function useRanking(
  top: number,
  cursoId?: number,
  moduloId?: number,
  turnoId?: number,
) {
  return useQuery({
    queryKey: ['ranking', top, cursoId, moduloId, turnoId],
    queryFn: () => buscarRanking(top, cursoId, moduloId, turnoId),
    staleTime: 1000 * 60 * 10, // 10 minutos
    placeholderData: keepPreviousData,
  });
}
