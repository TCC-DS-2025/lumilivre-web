import { useState, useEffect } from 'react';
import { FilterPanel } from '../FilterPanel';
import { CustomSelect } from '../CustomSelect';

import { buscarCursos, type Curso } from '../../services/cursoService';
import { buscarModulos } from '../../services/moduloService';

interface StudentFilterProps {
  isOpen: boolean;
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

export function StudentFilter({
  isOpen,
  filters,
  onFilterChange,
  onApply,
  onClear,
}: StudentFilterProps) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([buscarCursos(), buscarModulos()])
      .then(([pageCursos, listaModulos]) => {
        setCursos(pageCursos.content);
        setModulos(listaModulos);
      })
      .catch(console.error);
  }, []);

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

  const cursoOptions = [
    { label: 'Todos', value: '' },
    ...cursos.map((c) => ({ label: c.nome, value: c.nome })),
  ];

  const moduloOptions = [
    { label: 'Todos', value: '' },
    ...modulos.map((m) => ({ label: m, value: m })),
  ];

  const labelStyles =
    'block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1';
  const inputStyles =
    'w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none h-[42px]';

  return (
    <FilterPanel isOpen={isOpen} onApply={onApply} onClear={onClear}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelStyles}>Status de Penalidade</label>
          <CustomSelect
            value={filters.penalidade}
            onChange={(val) => onFilterChange('penalidade', val)}
            options={penalidadeOptions}
            placeholder="Selecione"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelStyles}>Data de Nascimento</label>
          <input
            name="dataNascimento"
            type="date"
            value={filters.dataNascimento}
            onChange={(e) => onFilterChange('dataNascimento', e.target.value)}
            className={inputStyles}
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
          />
        </div>

        <div>
          <label className={labelStyles}>Turno</label>
          <CustomSelect
            value={filters.turno}
            onChange={(val) => onFilterChange('turno', val)}
            options={turnoOptions}
            placeholder="Selecione"
          />
        </div>

        <div>
          <label className={labelStyles}>Módulo</label>
          <CustomSelect
            value={filters.modulo}
            onChange={(val) => onFilterChange('modulo', val)}
            options={moduloOptions}
            placeholder="Selecione"
          />
        </div>
      </div>
    </FilterPanel>
  );
}
