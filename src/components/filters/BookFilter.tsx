import { useState, useEffect } from 'react';
import { FilterPanel } from '../FilterPanel';
import { CustomSelect } from '../CustomSelect';

import { buscarGeneros, type Genero } from '../../services/generoService';
import { buscarEnum } from '../../services/livroService';

interface BookFilterProps {
  isOpen: boolean;
  filters: {
    autor: string;
    editora: string;
    genero: string;
    cdd: string;
    classificacaoEtaria: string;
    tipoCapa: string;
    dataLancamento: string;
  };
  onFilterChange: (field: string, value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

interface EnumOption {
  nome: string;
  status: string;
}

export function BookFilter({
  isOpen,
  filters,
  onFilterChange,
  onApply,
  onClear,
}: BookFilterProps) {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [cddOptions, setCddOptions] = useState<EnumOption[]>([]);
  const [classificacaoOptions, setClassificacaoOptions] = useState<
    EnumOption[]
  >([]);
  const [tipoCapaOptions, setTipoCapaOptions] = useState<EnumOption[]>([]);

  useEffect(() => {
    // Carrega todas as listas necessárias
    Promise.all([
      buscarGeneros(),
      buscarEnum('CDD'),
      buscarEnum('CLASSIFICACAO_ETARIA'),
      buscarEnum('TIPO_CAPA'),
    ])
      .then(([generosData, cddData, classData, capaData]) => {
        setGeneros(generosData);
        setCddOptions(cddData);
        setClassificacaoOptions(classData);
        setTipoCapaOptions(capaData);
      })
      .catch(console.error);
  }, []);

  // Helpers de opções
  const generoOpts = [
    { label: 'Todos', value: '' },
    ...generos.map((g) => ({ label: g.nome, value: g.nome })),
  ];

  const cddOpts = [
    { label: 'Todos', value: '' },
    ...cddOptions.map((c) => ({
      label: `${c.nome} - ${c.status}`,
      value: c.nome,
    })),
  ];

  const classOpts = [
    { label: 'Todas', value: '' },
    ...classificacaoOptions.map((c) => ({ label: c.status, value: c.nome })),
  ];

  const capaOpts = [
    { label: 'Todas', value: '' },
    ...tipoCapaOptions.map((c) => ({ label: c.status, value: c.nome })),
  ];

  const labelStyles =
    'block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1';
  const inputStyles =
    'w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none h-[42px]';

  return (
    <FilterPanel
      isOpen={isOpen}
      onApply={onApply}
      onClear={onClear}
      width="w-[800px]"
    >
      {/* Linha 1: Autor, Editora, Gênero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelStyles}>Autor</label>
          <input
            type="text"
            value={filters.autor}
            onChange={(e) => onFilterChange('autor', e.target.value)}
            placeholder="Nome do autor"
            className={inputStyles}
          />
        </div>
        <div>
          <label className={labelStyles}>Editora</label>
          <input
            type="text"
            value={filters.editora}
            onChange={(e) => onFilterChange('editora', e.target.value)}
            placeholder="Nome da editora"
            className={inputStyles}
          />
        </div>
        <div>
          <label className={labelStyles}>Gênero</label>
          <CustomSelect
            value={filters.genero}
            onChange={(val) => onFilterChange('genero', val)}
            options={generoOpts}
            placeholder="Selecione"
          />
        </div>
      </div>

      {/* Linha 2: CDD, Classificação, Tipo Capa, Lançamento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className={labelStyles}>CDD</label>
          <CustomSelect
            value={filters.cdd}
            onChange={(val) => onFilterChange('cdd', val)}
            options={cddOpts}
            placeholder="Selecione"
          />
        </div>
        <div>
          <label className={labelStyles}>Classificação</label>
          <CustomSelect
            value={filters.classificacaoEtaria}
            onChange={(val) => onFilterChange('classificacaoEtaria', val)}
            options={classOpts}
            placeholder="Selecione"
          />
        </div>
        <div>
          <label className={labelStyles}>Tipo de Capa</label>
          <CustomSelect
            value={filters.tipoCapa}
            onChange={(val) => onFilterChange('tipoCapa', val)}
            options={capaOpts}
            placeholder="Selecione"
          />
        </div>
        <div>
          <label className={labelStyles}>Lançamento</label>
          <input
            type="date"
            value={filters.dataLancamento}
            onChange={(e) => onFilterChange('dataLancamento', e.target.value)}
            className={inputStyles}
          />
        </div>
      </div>
    </FilterPanel>
  );
}
