import { useQuery } from '@tanstack/react-query';

import { buscarGeneros } from '../services/generoService';
import { buscarCdds, buscarEnum } from '../services/livroService';
import { buscarCursos } from '../services/cursoService';
import { buscarModulos } from '../services/moduloService';
import { buscarTurnos } from '../services/turnoService';

const STATIC_DATA_CONFIG = {
  staleTime: 1000 * 60 * 60 * 24,
  gcTime: 1000 * 60 * 60 * 24,
  refetchOnMount: false,
};

// --- Livros ---

export function useGeneros() {
  return useQuery({
    queryKey: ['generos'],
    queryFn: buscarGeneros,
    ...STATIC_DATA_CONFIG,
  });
}

export function useCdds() {
  return useQuery({
    queryKey: ['cdds'],
    queryFn: buscarCdds,
    ...STATIC_DATA_CONFIG,
  });
}

export function useEnum(tipo: string) {
  return useQuery({
    queryKey: ['enum', tipo],
    queryFn: () => buscarEnum(tipo),
    ...STATIC_DATA_CONFIG,
  });
}

// --- Alunos ---

export function useCursos() {
  return useQuery({
    queryKey: ['cursos'],
    queryFn: async () => {
      const response = await buscarCursos();
      return response.content;
    },
    ...STATIC_DATA_CONFIG,
  });
}

export function useModulos() {
  return useQuery({
    queryKey: ['modulos'],
    queryFn: buscarModulos,
    ...STATIC_DATA_CONFIG,
  });
}

export function useTurnos() {
  return useQuery({
    queryKey: ['turnos'],
    queryFn: buscarTurnos,
    ...STATIC_DATA_CONFIG,
  });
}