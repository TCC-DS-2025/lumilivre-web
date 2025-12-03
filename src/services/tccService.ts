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
  foto: string | null;
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

export interface TccFilterParams {
  cursoId?: string;
  semestre?: string;
  ano?: string;
}

export const listarTccs = async (texto?: string): Promise<TccResponse[]> => {
  const params = texto ? { texto } : {};
  const response = await api.get('/tcc/buscar', { params });
  return response.data.data || [];
};

export const buscarTccPorId = async (id: number): Promise<TccResponse> => {
  const response = await api.get(`/tcc/buscar/${id}`);
  return response.data.data;
};

export const listarTccsAvancado = async (
  params: TccFilterParams,
): Promise<TccResponse[]> => {
  const response = await api.get('/tcc/buscar/avancado', { params });
  return response.data.data || [];
};

export const cadastrarTcc = async (
  tccData: TccPayload,
  filePdf?: File | null,
  fileFoto?: File | null,
) => {
  const formData = new FormData();
  formData.append('dadosJson', JSON.stringify(tccData));

  if (filePdf) formData.append('arquivoPdf', filePdf);
  if (fileFoto) formData.append('arquivoFoto', fileFoto);

  const response = await api.post('/tcc/cadastrar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const atualizarTcc = async (
  id: number,
  tccData: TccPayload,
  filePdf?: File | null,
  fileFoto?: File | null,
) => {
  const formData = new FormData();
  formData.append('dadosJson', JSON.stringify(tccData));

  if (filePdf) formData.append('arquivoPdf', filePdf);
  if (fileFoto) formData.append('arquivoFoto', fileFoto);

  const response = await api.put(`/tcc/atualizar/${id}`, formData, {
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
