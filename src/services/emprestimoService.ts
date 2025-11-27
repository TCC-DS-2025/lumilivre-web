import api from './api';
import type { Page } from '../types';

export interface EmprestimoListagemDTO {
  id: number;
  statusEmprestimo: 'ATIVO' | 'ATRASADO' | 'CONCLUIDO';
  livroNome: string;
  livroTombo: string;
  nomeAluno: string;
  matriculaAluno: string;
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
  dataDevolucao: string;
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
  tombo?: string;
  livroNome?: string;
  alunoNome?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface EmprestimoPayload {
  id?: number;
  aluno_matricula: string;
  exemplar_tombo: string;
  data_emprestimo: string;
  data_devolucao: string;
}

// --- BUSCAS ---

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

export const buscarEmprestimosAvancado = async (
  params: EmprestimoFilterParams,
): Promise<Page<EmprestimoListagemDTO>> => {
  const response = await api.get('/emprestimos/buscar/avancado', { params });
  return response.data;
};

export const getContagemAtrasados = async (): Promise<number> => {
  try {
    const response = await api.get('/emprestimos/buscar/apenas-atrasados');
    if (response.status === 204 || !response.data) {
      return 0;
    }
    return response.data.length;
  } catch (error) {
    console.error('Erro ao buscar contagem de atrasados:', error);
    return 0;
  }
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

// --- HISTÓRICO DO ALUNO ---

export const buscarHistoricoAluno = async (matricula: string) => {
  const response = await api.get(`/emprestimos/aluno/${matricula}/historico`);
  return response.data;
};

export const buscarEmprestimosAtivosAluno = async (matricula: string) => {
  const response = await api.get(`/emprestimos/aluno/${matricula}`);
  return response.data;
};

// --- AÇÕES DE ESCRITA ---

export const cadastrarEmprestimo = async (payload: EmprestimoPayload) => {
  const response = await api.post('/emprestimos/cadastrar', payload);
  return response.data;
};

export const atualizarEmprestimo = async (
  id: number,
  payload: EmprestimoPayload,
) => {
  const response = await api.put(`/emprestimos/atualizar/${id}`, payload);
  return response.data;
};

export const concluirEmprestimo = async (id: number) => {
  const response = await api.put(`/emprestimos/concluir/${id}`);
  return response.data;
};

export const excluirEmprestimo = async (id: number) => {
  const response = await api.delete(`/emprestimos/excluir/${id}`);
  return response.data;
};
