import api from './api';
import type { Page } from '../types';

export interface EmprestimoListagemDTO {
  statusEmprestimo: 'ATIVO' | 'ATRASADO' | 'CONCLUIDO';
  livroNome: string;
  livroTombo: string;
  nomeAluno: string;
  curso: string;
  dataEmprestimo: string;
  dataDevolucao: string;
}

export interface EmprestimoAtivoDTO {
  id: number;
  livroNome: string;
  alunoNome: string;
  alunoMatricula: string;
  tombo: string;
  dataDevolucao: string; // O backend envia 'yyyy-MM-dd'
  statusEmprestimo: 'ATIVO' | 'ATRASADO' | 'CONCLUIDO';
}

export interface AlunoRanking {
  matricula: string;
  nome: string;
  emprestimosCount: number;
}

export interface EmprestimoFilterParams {
  statusEmprestimo?: string;
  dataEmprestimo?: string;
  dataDevolucao?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const buscarEmprestimosPaginado = async (
  texto: string,
  page: number,
  size: number,
  sort: string,
): Promise<Page<EmprestimoListagemDTO>> => {
  const params = {
    page,
    size,
    sort,
    texto: texto || undefined,
  };

  const endpoint =
    !texto || texto.trim() === '' ? '/emprestimos/home' : '/emprestimos/buscar';

  const response = await api.get<Page<EmprestimoListagemDTO>>(endpoint, {
    params,
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
  EmprestimoAtivoDTO[]
> => {
  const response = await api.get<EmprestimoAtivoDTO[]>(
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

export const buscarEmprestimosAvancado = async (
  params: EmprestimoFilterParams,
): Promise<Page<EmprestimoListagemDTO>> => {
  const response = await api.get('/emprestimos/buscar/avancado', { params });
  return response.data;
};
