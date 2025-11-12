import api from './api';

type StatusEmprestimoFiltro = 'ATIVO' | 'CONCLUIDO' | 'ATRASADO';

interface FiltrosEmprestimo {
  dataInicio?: string;
  dataFim?: string;
  status?: StatusEmprestimoFiltro;
}

export const gerarRelatorio = (
  tipo: 'emprestimos' | 'alunos' | 'livros' | 'exemplares',
  filtros: FiltrosEmprestimo = {},
) => {
  const params = new URLSearchParams();

  if (filtros.dataInicio) {
    params.append('dataInicio', filtros.dataInicio);
  }
  if (filtros.dataFim) {
    params.append('dataFim', filtros.dataFim);
  }
  if (filtros.status) {
    params.append('status', filtros.status);
  }

  const queryString = params.toString();
  const url = `${api.defaults.baseURL}/relatorios/${tipo}${queryString ? `?${queryString}` : ''}`;

  window.open(url, '_blank');
};