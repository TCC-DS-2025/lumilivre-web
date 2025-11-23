import api from './api';
import type { Page } from '../types';

export interface Curso {
  id: number;
  nome: string;
}

export interface CursoPayload {
  nome: string;
  turno: string;
  modulo: string;
}

export interface CursoEstatistica {
  nomeCurso: string;
  quantidadeAlunos: number;
  totalEmprestimos: number;
  mediaEmprestimosPorAluno: number;
}

export interface EstatisticaGrafico {
  nome: string;
  total: number;
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

export const cadastrarCurso = async (payload: CursoPayload): Promise<Curso> => {
  const response = await api.post('/cursos/cadastrar', payload);
  return response.data;
};

export const buscarEstatisticasCursos = async (): Promise<
  CursoEstatistica[]
> => {
  const response = await api.get<CursoEstatistica[]>('/cursos/estatisticas');
  return response.data;
};

export const buscarEstatisticasGrafico = async (
  tipo: 'curso' | 'modulo' | 'turno',
): Promise<EstatisticaGrafico[]> => {
  const endpointMap = {
    curso: '/cursos',
    modulo: '/modulos',
    turno: '/turnos',
  };

  const response = await api.get<EstatisticaGrafico[]>(
    `${endpointMap[tipo]}/estatisticas-grafico`,
  );
  return response.data;
};
