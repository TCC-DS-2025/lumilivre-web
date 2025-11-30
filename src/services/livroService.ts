import api from './api';

import type { Page } from '../types';
import type { Genero } from './generoService';

export interface ListaLivro {
  status: string;
  tomboExemplar: string;
  isbn: string;
  cdd: string;
  nome: string;
  genero: string;
  autor: string;
  editora: string;
  localizacao_fisica: string;
  responsavel?: string;
}

export interface LivroAgrupado {
  id: number;
  isbn: string;
  nome: string;
  autor: string;
  editora: string;
  quantidade: number;
}

export interface LivroFilterParams {
  nome?: string;
  isbn?: string;
  autor?: string;
  genero?: string;
  editora?: string;
  cdd?: string;
  classificacaoEtaria?: string;
  tipoCapa?: string;
  dataLancamento?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface LivroPayload {
  isbn: string;
  nome: string;
  data_lancamento: string;
  numero_paginas: number;
  cdd: string;
  editora: string;
  classificacao_etaria: string;
  edicao?: string;
  volume?: number;
  sinopse?: string;
  tipo_capa: string;
  generos: string[];
  autor: string[];
  imagem?: string;
}

export interface CddItem {
  id: string;
  nome: string;
}

export interface LivroDetalhado extends Omit<LivroPayload, 'generos'> {
  generos: Genero[];
}

export const getContagemLivros = async (): Promise<number> => {
  const response = await api.get('/livros/home', {
    params: { page: 0, size: 1 },
  });
  return response.data.totalElements || 0;
};

export const buscarLivrosParaAdmin = async (
  texto?: string,
  page = 0,
  size = 10,
  sort = 'nome,asc',
): Promise<Page<ListaLivro>> => {
  const response = await api.get('/livros/home', {
    params: { texto, page, size, sort },
  });
  return response.data;
};

export const buscarLivrosAgrupados = async (
  texto?: string,
  page = 0,
  size = 10,
  sort = 'nome,asc',
): Promise<Page<LivroAgrupado>> => {
  const response = await api.get('/livros/home/agrupado', {
    params: { texto, page, size, sort },
  });
  return response.data;
};

export const buscarLivrosAvancado = async (
  params: LivroFilterParams,
): Promise<Page<LivroAgrupado>> => {
  const response = await api.get('/livros/buscar/avancado', { params });
  return response.data;
};

export const cadastrarLivro = async (livroData: LivroPayload) => {
  const response = await api.post('/livros/cadastrar', livroData);
  return response.data;
};

export const uploadCapaLivro = async (isbn: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/livros/${isbn}/capa`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const buscarEnum = async (
  tipo: string,
): Promise<{ nome: string; status: string }[]> => {
  const response = await api.get(`/enums/${tipo}`);
  return response.data;
};

export const atualizarLivro = async (isbn: string, livroData: LivroPayload) => {
  const response = await api.put(`/livros/${isbn}`, livroData);
  return response.data;
};

export const excluirLivroComExemplares = async (isbn: string) => {
  const response = await api.delete(`/livros/${isbn}/com-exemplares`);
  return response.data;
};

export const buscarLivroPorIsbn = async (isbn: string) => {
  return api.get<LivroDetalhado>(`/livros/${isbn}`);
};

export const buscarCdds = async (): Promise<CddItem[]> => {
  const response = await api.get('/cdd');
  return response.data;
};
