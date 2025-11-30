import api from './api';

export interface Modulo {
  id: number;
  nome: string;
}

export interface ModuloPayload {
  nome: string;
}

export const buscarModulos = async (): Promise<Modulo[]> => {
  try {
    const response = await api.get<Modulo[]>('/modulos');
    return response.data || [];
  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    return [];
  }
};

export const cadastrarModulo = async (
  payload: ModuloPayload,
): Promise<Modulo> => {
  const response = await api.post('/modulos/cadastrar', payload);
  return response.data;
};
