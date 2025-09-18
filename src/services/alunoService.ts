import api from './api';

export const getContagemAlunos = async (): Promise<number> => {
  const response = await api.get('/alunos/buscar', {
    params: { page: 0, size: 1 },
  });
  return response.data.totalElements || 0;
};
