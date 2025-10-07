import api from './api';

export const buscarModulos = async (): Promise<string[]> => {
  try {
    const response = await api.get('/cursos/modulos');
    return response.data || [];
  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    return [];
  }
};
