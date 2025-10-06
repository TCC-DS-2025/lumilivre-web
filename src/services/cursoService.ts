import api from './api';
import type { Page } from '../types';

export interface Curso {
  id: number;
  nome: string;
}

export const buscarCursos = async (): Promise<Page<Curso>> => {
  try {
    const response = await api.get('/cursos/buscar');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    throw error;
  }
};

export const cadastrarCurso = async (nome: string): Promise<Curso> => {
  const response = await api.post('/cursos/cadastrar', { nome });
  return response.data;
};
