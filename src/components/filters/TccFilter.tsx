import { useMemo } from 'react';

import { FilterPanel } from '../FilterPanel';
import { CustomSelect } from '../CustomSelect';
import { SearchableSelect } from '../SearchableSelect';
import { useCursos } from '../../hooks/useCommonQueries';

interface TccFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    cursoId: string;
    semestre: string;
    ano: string;
  };
  onFilterChange: (field: string, value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export function TccFilter({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onClear,
}: TccFilterProps) {
  const { data: cursosData, isLoading } = useCursos();

  const cursosOpts = useMemo(() => {
    if (!cursosData) return [];
    return [
      { label: 'Todos', value: '' },
      ...cursosData.map((c) => ({ label: c.nome, value: c.id })),
    ];
  }, [cursosData]);

  const semestreOpts = [
    { label: 'Todos', value: '' },
    { label: '1º Semestre', value: '1' },
    { label: '2º Semestre', value: '2' },
  ];

  const anoOpts = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [{ label: 'Todos', value: '' }];
    for (let i = currentYear + 1; i >= currentYear - 10; i--) {
      years.push({ label: String(i), value: String(i) });
    }
    return years;
  }, []);

  return (
    <FilterPanel
      isOpen={isOpen}
      onClose={onClose}
      onApply={onApply}
      onClear={onClear}
      width="w-[500px]"
    >
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Carregando...</div>
      ) : (
        <div className="space-y-4">
          <SearchableSelect
            label="Curso"
            value={filters.cursoId}
            onChange={(val) => onFilterChange('cursoId', val)}
            options={cursosOpts}
            placeholder="Selecione o curso"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Semestre
              </label>
              <CustomSelect
                value={filters.semestre}
                onChange={(val) => onFilterChange('semestre', val)}
                options={semestreOpts}
                placeholder="Selecione"
                invertArrow
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Ano
              </label>
              <CustomSelect
                value={filters.ano}
                onChange={(val) => onFilterChange('ano', val)}
                options={anoOpts}
                placeholder="Selecione"
                invertArrow
              />
            </div>
          </div>
        </div>
      )}
    </FilterPanel>
  );
}
