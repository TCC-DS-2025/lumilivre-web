import api from './api';

export interface FiltrosRelatorio {
  dataInicio?: string;
  dataFim?: string;
  idModulo?: number;
  idCurso?: number;
  idTurno?: number;
  penalidade?: string;
  genero?: string;
  autor?: string;
  editora?: string;
  cdd?: string;
  classificacaoEtaria?: string;
  tipoCapa?: string;
  statusLivro?: string;
  isbnOuTombo?: string;
  statusEmprestimo?: string;
  matriculaAluno?: string;
}

export const baixarRelatorioPDF = async (
  tipo: 'emprestimos' | 'alunos' | 'livros' | 'exemplares',
  filtros: FiltrosRelatorio,
) => {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    // 1. Ignora valores nulos, undefined ou strings vazias
    if (value === null || value === undefined || value === '') {
      return;
    }

    // 2. Mapeia os campos de status para a chave genérica 'status' que o backend espera
    if (key === 'statusLivro' || key === 'statusEmprestimo') {
      params.append('status', String(value));
    } else {
      // 3. Adiciona todos os outros filtros (datas, ids, textos)
      params.append(key, String(value));
    }
  });

  try {
    const response = await api.get(`/relatorios/${tipo}`, {
      params: params,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    const contentDisposition = response.headers['content-disposition'];
    let fileName = `relatorio-${tipo}.pdf`;
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (fileNameMatch && fileNameMatch.length === 2)
        fileName = fileNameMatch[1];
    }

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar relatório:', error);
    throw error;
  }
};
