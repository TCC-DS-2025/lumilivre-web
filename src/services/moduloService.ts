import api from './api';

interface ModuloResponse {
  id: number;
  nome: string;
}

export const buscarModulos = async (): Promise<string[]> => {
  try {
    const response = await api.get<ModuloResponse[]>('/modulos');
    const listaNomes = response.data.map((item) => item.nome);
    
    return listaNomes || [];
  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    return [];
  }
};