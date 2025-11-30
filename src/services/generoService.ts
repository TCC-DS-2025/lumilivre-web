import api from './api';

export interface Genero {
  id: number;
  nome: string;
  nomePtBr?: string;
}

export const buscarGeneros = async (): Promise<Genero[]> => {
  const response = await api.get<Genero[]>('/generos');
  return response.data;
};
