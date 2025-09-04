import api from './api';
import type { Emprestimo } from '../types';

export const getContagemAtrasados = async (): Promise<number> => {
    const response = await api.get('/emprestimos/buscar/atrasados');
    return response.data.length || 0;
};

export const buscarEmprestimosAtivos = async (): Promise<Emprestimo[]> => {
    const response = await api.get('/emprestimos/buscar/ativos');
    return response.data || [];
};