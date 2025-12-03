import api from './api';

export interface LivroGoogle {
  nome: string;
  autor: string;
  editora: string;
  data_lancamento: string;
  numero_paginas: number;
  generos: string[];
  sinopse: string;
  imagem: string;
}

export const buscarLivroPorIsbn = async (isbn: string) => {
  try {
    const response = await api.get(`/livros/consulta-isbn/${isbn}`);

    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar ISBN no backend:', error);
    throw new Error('Livro não encontrado nas bases de dados.');
  }
};
