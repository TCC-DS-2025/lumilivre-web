import { useState, useEffect } from 'react';

import { FilterPanel } from '../FilterPanel';
import { CustomSelect } from '../CustomSelect';
import { CustomDatePicker } from '../CustomDatePicker';

import { buscarEnum } from '../../services/livroService';

interface LoanFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    statusEmprestimo: string;
    dataEmprestimo: string;
    dataDevolucao: string;
  };
  onFilterChange: (field: string, value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

interface Option {
  label: string;
  value: string | number;
}

export function LoanFilter({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onClear,
}: LoanFilterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      buscarEnum('STATUS_EMPRESTIMO')
        .then((data) => {
          setStatusOptions([
            { label: 'Todos', value: '' },
            ...data.map((s) => ({ label: s.status, value: s.nome })),
          ]);
        })
        .catch((error) => {
          console.error('Erro ao carregar status:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  const labelStyles =
    'block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1';

  return (
    <FilterPanel
      isOpen={isOpen}
      onClose={onClose}
      onApply={onApply}
      onClear={onClear}
      width="w-[600px]"
    >
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">
          Carregando filtros...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div className="md:col-span-2">
            <label className={labelStyles}>Status do Empréstimo</label>
            <CustomSelect
              value={filters.statusEmprestimo}
              onChange={(val) => onFilterChange('statusEmprestimo', val)}
              options={statusOptions}
              invertArrow={true}
            />
          </div>

          {/* Datas */}
          <CustomDatePicker
            label="Data do Empréstimo"
            value={filters.dataEmprestimo}
            onChange={(e) => onFilterChange('dataEmprestimo', e.target.value)}
          />

          <CustomDatePicker
            label="Data de Devolução"
            value={filters.dataDevolucao}
            onChange={(e) => onFilterChange('dataDevolucao', e.target.value)}
          />
        </div>
      )}
    </FilterPanel>
  );
}