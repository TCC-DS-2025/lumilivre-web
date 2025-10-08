import api from './api';
import type { Page } from '../types';

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
  genero: string;
  autor: string;
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
): Promise<Page<ListaLivro>> => {
  const response = await api.get('/livros/buscar/avancado', { params });
  return response.data;
};

export const cadastrarLivro = async (livroData: LivroPayload) => {
  const response = await api.post('/livros/cadastrar', livroData);
  return response.data;
};

// upload da capa de um livro existente
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
