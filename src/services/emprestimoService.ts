import api from './api';
import type { Emprestimo, Page } from '../types';

export interface ListaEmprestimo {
  id: number;
  statusEmprestimo: 'ATIVO' | 'ATRASADO' | 'CONCLUIDO';
  exemplar: {
    tombo: string;
    livro: {
      nome: string;
    };
  };
  aluno: {
    nomeCompleto: string;
    curso: {
      nome: string;
    };
  };
  dataEmprestimo: string;
  dataDevolucao: string;
}

export interface AlunoRanking {
  matricula: string;
  nome: string;
  emprestimosCount: number;
}

export const buscarEmprestimosPaginado = async (
  texto: string,
  page: number,
  size: number,
  sort: string,
): Promise<Page<ListaEmprestimo>> => {
  
  if (!texto || texto.trim() === '') {
    const response = await api.get('/emprestimos/home', {
      params: {
        page,
        size,
        sort,
      },
    });
    return response.data;
  }

  const response = await api.get('/emprestimos/buscar', {
    params: {
      texto,
      page,
      size,
      sort,
    },
  });
  return response.data;
};

export const getContagemAtrasados = async (): Promise<number> => {
  const response = await api.get('/emprestimos/buscar/apenas-atrasados');
  return response.data.length || 0;
};

export const getContagemEmprestimosTotais = async (): Promise<number> => {
  const response = await api.get('/emprestimos/contagem/ativos-e-atrasados');
  return response.data || 0;
};

export const buscarEmprestimosAtivosEAtrasados = async (): Promise<
  Emprestimo[]
> => {
  const response = await api.get<Emprestimo[]>(
    '/emprestimos/buscar/ativos-e-atrasados',
  );
  return response.data || [];
};

export const buscarRanking = async (
  top: number = 10,
  cursoId?: number,
  moduloId?: number,
  turnoId?: number,
): Promise<AlunoRanking[]> => {
  const params: any = { top };
  if (cursoId) params.cursoId = cursoId;
  if (moduloId) params.moduloId = moduloId;
  if (turnoId) params.turnoId = turnoId;

  const response = await api.get<AlunoRanking[]>('/emprestimos/ranking', {
    params,
  });
  return response.data || [];
};
