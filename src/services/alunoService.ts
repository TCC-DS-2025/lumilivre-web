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
  nome: string;
  email: string;
  celular: string;
  cursoNome: string;
}

export const buscarAlunosParaAdmin = async (
  texto?: string,
  page = 0,
  size = 10,
): Promise<Page<ListaAluno>> => {
  const response = await api.get('/alunos/home', {
    params: {
      texto, 
      page,
      size,
    },
  });
  return response.data;
};

export interface AlunoPayload {
  matricula: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  celular?: string;
  dataNascimento?: string;
  email: string;
  cursoId: number;
  cep?: string;
  numero?: number;
  complemento?: string;
}

export const cadastrarAluno = async (alunoData: AlunoPayload) => {
  const response = await api.post('/alunos/cadastrar', alunoData);
  return response.data;
};
