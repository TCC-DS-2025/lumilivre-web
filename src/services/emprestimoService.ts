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

export const buscarEmprestimosPaginado = async (
  texto: string,
  page: number,
  size: number,
  sort: string,
): Promise<Page<ListaEmprestimo>> => {
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
