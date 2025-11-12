import api from './api';

export interface SolicitacaoPendente {
  id: number;
  alunoNome: string;
  livroNome: string;
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
