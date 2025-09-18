import api from './api';
import type { Emprestimo } from '../types';

export const getContagemAtrasados = async (): Promise<number> => {
  // Agora chama o endpoint que busca APENAS os atrasados
  const response = await api.get('/emprestimos/buscar/apenas-atrasados');
  return response.data.length || 0;
};

export const getContagemEmprestimosTotais = async (): Promise<number> => {
  // Agora chama o endpoint de contagem direta
  const response = await api.get('/emprestimos/contagem/ativos-e-atrasados');
  return response.data || 0;
};

export const buscarEmprestimosAtivosEAtrasados = async (): Promise<
  Emprestimo[]
> => {
  // Agora chama o endpoint que busca a lista combinada
  const response = await api.get<Emprestimo[]>(
    '/emprestimos/buscar/ativos-e-atrasados',
  );
  return response.data || [];
};
