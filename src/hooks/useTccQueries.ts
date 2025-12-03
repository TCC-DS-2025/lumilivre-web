import { useQuery } from '@tanstack/react-query';
import {
  listarTccs,
  listarTccsAvancado,
  type TccFilterParams,
} from '../services/tccService';

export function useTccs(termoBusca: string, filtros: TccFilterParams) {
  return useQuery({
    queryKey: ['tccs', termoBusca, filtros],
    queryFn: () => {
      const temFiltro = Object.values(filtros).some((val) => val !== '');

      if (temFiltro) {
        return listarTccsAvancado(filtros);
      }

      return listarTccs(termoBusca);
    },
    staleTime: 1000 * 60 * 2,
  });
}
