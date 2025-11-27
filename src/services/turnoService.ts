import api from './api';

export interface Turno {
  id: number;
  nome: string;
}

export const buscarTurnos = async (): Promise<Turno[]> => {
  const response = await api.get<Turno[]>('/turnos');
  return response.data;
};
