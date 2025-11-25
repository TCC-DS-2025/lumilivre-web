import { useState, useEffect } from 'react';

import { FilterPanel } from '../FilterPanel';
import { CustomSelect } from '../CustomSelect';
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

interface EnumOption {
  nome: string;
  status: string;
}

export function LoanFilter({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onClear,
}: LoanFilterProps) {
  const [statusOptions, setStatusOptions] = useState<EnumOption[]>([]);

  useEffect(() => {
    buscarEnum('STATUS_EMPRESTIMO')
      .then((data) => setStatusOptions(data))
      .catch(console.error);
  }, []);

  const statusOpts = [
    { label: 'Todos', value: '' },
    ...statusOptions.map((s) => ({ label: s.status, value: s.nome })),
  ];

  const labelStyles =
    'block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1';
  const inputStyles =
    'w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none h-[42px]';

  return (
    <FilterPanel
      isOpen={isOpen}
      onClose={onClose}
      onApply={onApply}
      onClear={onClear}
      width="w-[500px]"
    >
      <div className="space-y-4">

        <div>
          <label className={labelStyles}>Status do Empréstimo</label>
          <CustomSelect
            value={filters.statusEmprestimo}
            onChange={(val) => onFilterChange('statusEmprestimo', val)}
            options={statusOpts}
            placeholder="Selecione o status"
          />
        </div>


        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyles}>Empréstimo (A partir de)</label>
            <input
              type="date"
              value={filters.dataEmprestimo}
              onChange={(e) => onFilterChange('dataEmprestimo', e.target.value)}
              className={inputStyles}
            />
          </div>
          <div>
            <label className={labelStyles}>Devolução (Até)</label>
            <input
              type="date"
              value={filters.dataDevolucao}
              onChange={(e) => onFilterChange('dataDevolucao', e.target.value)}
              className={inputStyles}
            />
          </div>
        </div>
      </div>
    </FilterPanel>
  );
}
