import api from './api';
import type { ListaLivro } from './livroService';

export interface ExemplarPayload {
  tombo: string;
  livro_isbn: string;
  status_livro: 'DISPONIVEL'; // sempre será disponível ao criar
  localizacao_fisica: string;
}

export const buscarExemplaresPorIsbn = async (
  isbn: string,
): Promise<ListaLivro[]> => {
  const response = await api.get(`/livros/exemplares/buscar/${isbn}`);
  return response.data;
};

export const cadastrarExemplar = async (payload: ExemplarPayload) => {
  const response = await api.post('/livros/exemplares/cadastrar', payload);
  return response.data;
};
