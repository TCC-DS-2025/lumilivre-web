import api from './api';

export const getContagemLivros = async (): Promise<number> => {
  const response = await api.get('/livros/home', {
    params: { page: 0, size: 1 },
  });
  return response.data.totalElements || 0;
};
