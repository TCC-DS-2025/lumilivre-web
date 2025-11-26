import api from './api';

export interface FiltrosRelatorio {
  dataInicio?: string;
  dataFim?: string;

  // alunos
  idModulo?: number;
  idCurso?: number;
  idTurno?: number;
  penalidade?: string;

  // livros
  genero?: string;
  autor?: string;
  editora?: string;
  cdd?: string;
  classificacaoEtaria?: string;
  tipoCapa?: string;

  // exemplares
  statusLivro?: string;
  isbnOuTombo?: string;

  // emprestimos
  statusEmprestimo?: string;
  matriculaAluno?: string;
}

export const baixarRelatorioPDF = async (
  tipo: 'emprestimos' | 'alunos' | 'livros' | 'exemplares',
  filtros: FiltrosRelatorio,
) => {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      if (key === 'statusLivro' || key === 'statusEmprestimo') {
        params.append('status', String(value));
      } else {
        params.append(key, String(value));
      }
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
