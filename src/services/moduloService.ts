import api from './api';

export interface Modulo {
  id: number;
  nome: string;
}

export const buscarModulos = async (): Promise<Modulo[]> => {
  const response = await api.get('/modulos');
  return response.data;
};

export const cadastrarModulo = async (moduloData: {
  nome: string;
}): Promise<Modulo> => {
  const response = await api.post('/modulos', moduloData);
  return response.data;
};
