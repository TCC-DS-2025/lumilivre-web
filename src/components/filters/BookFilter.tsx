import { useState, useEffect } from 'react';

import { FilterPanel } from '../FilterPanel';
import { CustomSelect } from '../CustomSelect';
import { SearchableSelect } from '../SearchableSelect';

import { buscarGeneros } from '../../services/generoService';
import {
  buscarEnum,
  buscarCdds,
  buscarLivrosParaAdmin,
} from '../../services/livroService';

interface BookFilterProps {
  isOpen: boolean;
  onClose: () => void;
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

interface Option {
  label: string;
  value: string | number;
}

export function BookFilter({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onClear,
}: BookFilterProps) {
  const [generosOpts, setGenerosOpts] = useState<Option[]>([]);
  const [cddOpts, setCddOpts] = useState<Option[]>([]);
  const [classificacaoOpts, setClassificacaoOpts] = useState<Option[]>([]);
  const [tipoCapaOpts, setTipoCapaOpts] = useState<Option[]>([]);
  const [autoresOpts, setAutoresOpts] = useState<Option[]>([]);
  const [editorasOpts, setEditorasOpts] = useState<Option[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const carregarDados = async () => {
        try {
          const [
            generosData,
            cddData,
            classificacaoData,
            capaData,
            livrosData,
          ] = await Promise.all([
            buscarGeneros(),
            buscarCdds(),
            buscarEnum('CLASSIFICACAO_ETARIA'),
            buscarEnum('TIPO_CAPA'),
            buscarLivrosParaAdmin('', 0, 1000),
          ]);

          setGenerosOpts([
            { label: 'Todos', value: '' },
            ...generosData.map((g) => ({ label: g.nome, value: g.nome })),
          ]);

          setCddOpts([
            { label: 'Todos', value: '' },
            ...cddData.map((c) => ({
              label: `${c.id} - ${c.nome}`,
              value: c.id,
            })),
          ]);

          setClassificacaoOpts([
            { label: 'Todas', value: '' },
            ...classificacaoData.map((c) => ({
              label: c.status,
              value: c.nome,
            })),
          ]);

          setTipoCapaOpts([
            { label: 'Todas', value: '' },
            ...capaData.map((c) => ({ label: c.status, value: c.nome })),
          ]);

          const autoresUnicos = Array.from(
            new Set(livrosData.content.map((l) => l.autor).filter(Boolean)),
          ).sort();
          setAutoresOpts([
            { label: 'Todos', value: '' },
            ...autoresUnicos.map((a) => ({ label: a, value: a })),
          ]);

          const editorasUnicas = Array.from(
            new Set(livrosData.content.map((l) => l.editora).filter(Boolean)),
          ).sort();
          setEditorasOpts([
            { label: 'Todas', value: '' },
            ...editorasUnicas.map((e) => ({ label: e, value: e })),
          ]);
        } catch (error) {
          console.error('Erro ao carregar filtros:', error);
        } finally {
          setIsLoading(false);
        }
      };

      carregarDados();
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect
            label="Autor"
            value={filters.autor}
            onChange={(val) => onFilterChange('autor', val)}
            options={autoresOpts}
          />

          <SearchableSelect
            label="Editora"
            value={filters.editora}
            onChange={(val) => onFilterChange('editora', val)}
            options={editorasOpts}
          />

          <SearchableSelect
            label="Gênero"
            value={filters.genero}
            onChange={(val) => onFilterChange('genero', val)}
            options={generosOpts}
          />

          {/* Ajustar a pesca por CDD */}
          <SearchableSelect
            label="CDD"
            value={filters.cdd}
            onChange={(val) => onFilterChange('cdd', val)}
            options={cddOpts}
          />

          <div>
            <label className={labelStyles}>Classificação</label>
            <CustomSelect
              value={filters.classificacaoEtaria}
              onChange={(val) => onFilterChange('classificacaoEtaria', val)}
              options={classificacaoOpts}
              invertArrow={true}
            />
          </div>

          <div>
            <label className={labelStyles}>Capa</label>
            <CustomSelect
              value={filters.tipoCapa}
              onChange={(val) => onFilterChange('tipoCapa', val)}
              placeholder="Selecione o Tipo de Capa"
              options={tipoCapaOpts}
              invertArrow={true}
            />
          </div>

          <div className="hidden md:block"></div>
        </div>
      )}
    </FilterPanel>
  );
}
