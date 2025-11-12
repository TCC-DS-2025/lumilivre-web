import api from './api';
import type { ListaLivro } from './livroService';

export interface ExemplarPayload {
  tombo: string;
  livro_isbn: string;
  status_livro: 'DISPONIVEL';
  localizacao_fisica: string;
}

export const buscarExemplaresPorLivroId = async (
  livroId: number,
): Promise<ListaLivro[]> => {
  const response = await api.get(`/livros/exemplares/livro/${livroId}`);
  return response.data;
};

export const cadastrarExemplar = async (payload: ExemplarPayload) => {
  const response = await api.post('/livros/exemplares/cadastrar', payload);
  return response.data;
};

export const excluirExemplar = async (tombo: string) => {
  const response = await api.delete(`/livros/exemplares/excluir/${tombo}`);
  return response.data;
};
