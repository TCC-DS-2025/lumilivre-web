import { useState, useEffect } from 'react';
import { FilterPanel } from '../FilterPanel';
import { CustomSelect } from '../CustomSelect';
import { CustomDatePicker } from '../CustomDatePicker';

import { buscarCursos } from '../../services/cursoService';
import { buscarModulos } from '../../services/moduloService';

interface StudentFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    penalidade: string;
    cursoNome: string;
    turno: string;
    modulo: string;
    dataNascimento: string;
  };
  onFilterChange: (field: string, value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

interface Option {
  label: string;
  value: string | number;
}

export function StudentFilter({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onClear,
}: StudentFilterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cursoOptions, setCursoOptions] = useState<Option[]>([]);
  const [moduloOptions, setModuloOptions] = useState<Option[]>([]);

  // Opções estáticas
  const penalidadeOptions = [
    { label: 'Todos', value: '' },
    { label: 'Advertência', value: 'ADVERTENCIA' },
    { label: 'Suspensão', value: 'SUSPENSAO' },
    { label: 'Bloqueio', value: 'BLOQUEIO' },
    { label: 'Banimento', value: 'BANIMENTO' },
  ];

  const turnoOptions = [
    { label: 'Todos', value: '' },
    { label: 'Manhã', value: 'MANHA' },
    { label: 'Tarde', value: 'TARDE' },
    { label: 'Noite', value: 'NOITE' },
    { label: 'Integral', value: 'INTEGRAL' },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      Promise.all([buscarCursos(), buscarModulos()])
        .then(([pageCursos, listaModulos]) => {
          // Mapear Cursos
          setCursoOptions([
            { label: 'Todos', value: '' },
            ...pageCursos.content.map((c) => ({ label: c.nome, value: c.nome })),
          ]);

          // Mapear Módulos
          setModuloOptions([
            { label: 'Todos', value: '' },
            ...listaModulos.map((m) => ({ label: m, value: m })),
          ]);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
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
    >
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">
          Carregando filtros...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelStyles}>Status de Penalidade</label>
              <CustomSelect
                value={filters.penalidade}
                onChange={(val) => onFilterChange('penalidade', val)}
                options={penalidadeOptions}
                placeholder="Selecione"
                invertArrow={true}
              />
            </div>

            <div className="md:col-span-2">
              <CustomDatePicker
                label="Data de Nascimento"
                value={filters.dataNascimento}
                onChange={(e) => onFilterChange('dataNascimento', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelStyles}>Curso</label>
              <CustomSelect
                value={filters.cursoNome}
                onChange={(val) => onFilterChange('cursoNome', val)}
                options={cursoOptions}
                placeholder="Selecione"
                invertArrow={true}
              />
            </div>

            <div>
              <label className={labelStyles}>Turno</label>
              <CustomSelect
                value={filters.turno}
                onChange={(val) => onFilterChange('turno', val)}
                options={turnoOptions}
                placeholder="Selecione"
                invertArrow={true}
              />
            </div>

            <div>
              <label className={labelStyles}>Módulo</label>
              <CustomSelect
                value={filters.modulo}
                onChange={(val) => onFilterChange('modulo', val)}
                options={moduloOptions}
                placeholder="Selecione"
                invertArrow={true}
              />
            </div>
          </div>
        </div>
      )}
    </FilterPanel>
  );
}