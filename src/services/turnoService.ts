import api from './api';

export interface Turno {
  id: number;
  nome: string;
}

export interface TurnoPayload {
  nome: string;
}

export const buscarTurnos = async (): Promise<Turno[]> => {
  const response = await api.get<Turno[]>('/turnos');
  return response.data;
};

export const cadastrarTurno = async (payload: TurnoPayload): Promise<Turno> => {
  const response = await api.post('/turnos/cadastrar', payload);
  return response.data;
};
