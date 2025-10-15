import api from './api';

export interface Genero {
  id: number;
  nome: string;
  nomePtBr?: string;
}

export const buscarGeneros = async (): Promise<Genero[]> => {
  try {
    const response = await api.get<Genero[]>('/generos');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    return [];
  }
};
