import { useEnum } from '../../hooks/useCommonQueries';
import { FilterPanel } from '../FilterPanel';
import { CustomSelect } from '../CustomSelect';
import { CustomDatePicker } from '../CustomDatePicker';

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
  const { data: statusData, isLoading } = useEnum('STATUS_EMPRESTIMO');

  const statusOptions: Option[] = [
    { label: 'Todos', value: '' },
    { label: 'Vence Hoje', value: 'VENCE_HOJE' },
    ...(statusData?.map((s) => ({ label: s.status, value: s.nome })) || []),
  ];

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
          <div className="md:col-span-2">
            <label className={labelStyles}>Status do Empréstimo</label>
            <CustomSelect
              value={filters.statusEmprestimo}
              onChange={(val) => onFilterChange('statusEmprestimo', val)}
              options={statusOptions}
              invertArrow={true}
            />
          </div>

          <CustomDatePicker
            label="Data do Empréstimo (A partir)"
            value={filters.dataEmprestimo}
            onChange={(e) => onFilterChange('dataEmprestimo', e.target.value)}
          />

          <CustomDatePicker
            label="Data de Devolução (Até)"
            value={filters.dataDevolucao}
            onChange={(e) => onFilterChange('dataDevolucao', e.target.value)}
          />
        </div>
      )}
    </FilterPanel>
  );
}
