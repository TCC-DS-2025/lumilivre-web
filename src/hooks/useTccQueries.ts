import { useQuery } from '@tanstack/react-query';
import { listarTccs } from '../services/tccService';

export function useTccs() {
  return useQuery({
    queryKey: ['tccs'],
    queryFn: listarTccs,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
