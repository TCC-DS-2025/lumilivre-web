import React, { useState, useEffect } from 'react';
import { buscarCursos, type Curso } from '../services/cursoService';

interface FilterPanelProps {
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

export function FiltroAvançado({
  filters,
  onFilterChange,
  onApply,
  onClear,
}: FilterPanelProps) {
  const [cursos, setCursos] = useState<Curso[]>([]);

  useEffect(() => {
    Promise.all([buscarCursos()])
      .then(([pageCursos]) => {
        setCursos(pageCursos.content);
      })
      .catch(console.error);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    onFilterChange(e.target.name, e.target.value);
  };

  const inputStyles =
    'w-full p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200';
  const labelStyles =
    'block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1';

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[700px] bg-white dark:bg-dark-card rounded-lg shadow-2xl z-20 border border-gray-200 dark:border-gray-700 select-none">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelStyles}>Status de Penalidade</label>
            <select
              name="penalidade"
              value={filters.penalidade}
              onChange={handleInputChange}
              className={inputStyles}
            >
              <option value="">Todos</option>
              <option value="ADVERTENCIA">Advertência</option>
              <option value="SUSPENSAO">Suspensão</option>
              <option value="BLOQUEIO">Bloqueio</option>
              <option value="BANIMENTO">Banimento</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelStyles}>Data de Nascimento</label>
            <input
              name="dataNascimento"
              type="date"
              value={filters.dataNascimento}
              onChange={handleInputChange}
              className={inputStyles}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelStyles}>Curso</label>
            <select
              name="cursoNome"
              value={filters.cursoNome}
              onChange={handleInputChange}
              className={inputStyles}
            >
              <option value="">Todos os Cursos</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.nome}>
                  {curso.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelStyles}>Turno</label>
            <select
              name="turno"
              value={filters.turno}
              onChange={handleInputChange}
              className={inputStyles}
            >
              <option value="">Todos</option>
              <option value="MANHA">Manhã</option>
              <option value="TARDE">Tarde</option>
              <option value="NOITE">Noite</option>
              <option value="INTEGRAL">Integral</option>
            </select>
          </div>
          <div>
            <label className={labelStyles}>Módulo</label>
            <input
              name="modulo"
              type="text"
              placeholder="Ex: 1º Bimestre"
              value={filters.modulo}
              onChange={handleInputChange}
              className={inputStyles}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClear}
            className="font-semibold py-2 px-4 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Limpar
          </button>
          <button
            onClick={onApply}
            className="bg-lumi-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-lumi-primary-hover transition-colors transform hover:scale-105"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
