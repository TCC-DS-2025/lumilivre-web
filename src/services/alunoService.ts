import api from './api';
import type { Page } from '../types';

export const getContagemAlunos = async (): Promise<number> => {
  const response = await api.get('/alunos/buscar', {
    params: { page: 0, size: 1 },
  });
  return response.data.totalElements || 0;
};

export interface ListaAluno {
  penalidade: string | null;
  matricula: string;
  nomeCompleto: string;
  dataNascimento: string;
  email: string;
  celular: string;
  cursoNome: string;
  turnoNome?: string; 
  moduloNome?: string;
  cursoId?: number;
}

export const buscarAlunosParaAdmin = async (
  texto?: string,
  page = 0,
  size = 10,
  sort = 'nomeCompleto,asc',
): Promise<Page<ListaAluno>> => {
  const response = await api.get('/alunos/home', {
    params: { texto, page, size, sort },
  });
  return response.data;
};

export interface AlunoPayload {
  matricula: string;
  nomeCompleto: string;
  cpf: string;
  celular?: string;
  dataNascimento?: string;
  email: string;
  cursoId: number;
  turnoId: number;
  moduloId: number; 
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  numero_casa?: number;
  complemento?: string;
  turno?: string; 
  modulo?: string; 
}

export const cadastrarAluno = async (alunoData: AlunoPayload) => {
  const response = await api.post('/alunos/cadastrar', alunoData);
  return response.data;
};

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
  page?: number;
  size?: number;
  sort?: string;
}

export const buscarAlunosAvancado = async (
  params: AlunoFilterParams,
): Promise<Page<ListaAluno>> => {
  const response = await api.get('/alunos/buscar/avancado', { params });
  return response.data;
};

export const buscarAlunoPorMatricula = async (matricula: string) => {
  const response = await api.get(`/alunos/${matricula}`);
  return response.data;
};

export const atualizarAluno = async (
  matricula: string,
  alunoData: AlunoPayload,
) => {
  const response = await api.put(`/alunos/atualizar/${matricula}`, alunoData);
  return response.data;
};

export const excluirAluno = async (matricula: string) => {
  const response = await api.delete(`/alunos/excluir/${matricula}`);
  return response.data;
};