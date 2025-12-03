import api from './api';

export interface TccResponse {
  id: number;
  titulo: string;
  alunos: string;
  orientadores: string;
  curso: string;
  anoConclusao: string;
  semestreConclusao: string;
  arquivoPdf: string | null;
  linkExterno: string | null;
  ativo: boolean;
}

export interface TccPayload {
  titulo: string;
  alunos: string;
  orientadores: string;
  curso_id: number;
  anoConclusao: string;
  semestreConclusao: string;
  linkExterno: string;
  ativo: boolean;
}

export const listarTccs = async (): Promise<TccResponse[]> => {
  const response = await api.get('/tcc/buscar');
  return response.data.data || [];
};

export const buscarTccPorId = async (id: number): Promise<TccResponse> => {
  const response = await api.get(`/tcc/buscar/${id}`);
  return response.data.data;
};

export const cadastrarTcc = async (tccData: TccPayload, file?: File | null) => {
  const formData = new FormData();

  formData.append('dadosJson', JSON.stringify(tccData));

  if (file) {
    formData.append('arquivoPdf', file);
  }

  const response = await api.post('/tcc/cadastrar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const excluirTcc = async (id: number) => {
  const response = await api.delete(`/tcc/excluir/${id}`);
  return response.data;
};
