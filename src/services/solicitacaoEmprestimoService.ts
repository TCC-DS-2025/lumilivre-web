import api from './api';

export interface SolicitacaoPendente {
  id: number;
  alunoNome: string;
  alunoMatricula?: string;
  livroNome: string;
  exemplarTombo?: string;
  dataSolicitacao: string;
}

export const buscarSolicitacoesPendentes = async (): Promise<
  SolicitacaoPendente[]
> => {
  try {
    const response = await api.get<SolicitacaoPendente[]>(
      '/solicitacoes/pendentes',
    );
    return response.data || [];
  } catch (error) {
    console.error('Erro ao buscar solicitações pendentes:', error);
    return [];
  }
};

export const processarSolicitacao = async (id: number, aceitar: boolean) => {
  const response = await api.post(`/solicitacoes/processar/${id}`, null, {
    params: { aceitar },
  });
  return response.data;
};
