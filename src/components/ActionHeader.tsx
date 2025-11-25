import { type ReactNode } from 'react';

import SearchIcon from '../assets/icons/search.svg?react';
import FilterIcon from '../assets/icons/filter.svg?react';
import AddIcon from '../assets/icons/add.svg?react';

interface ActionHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchPlaceholder: string;
  onAddNew: () => void;
  addNewButtonLabel: string;
  onFilterToggle?: () => void;
  showFilterButton?: boolean;
  isFilterOpen?: boolean;
  children?: ReactNode;
}

export function ActionHeader({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
  onAddNew,
  addNewButtonLabel,
  onFilterToggle,
  showFilterButton = false,
  isFilterOpen = false,
  children,
}: ActionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 shrink-0">
      <div className="flex items-center space-x-3">
        {children}

        {/* Barra de Pesquisa */}
        <div className="relative mr-2 select-none">
          <button
            onClick={onSearchSubmit}
            aria-label="Pesquisar"
            className="absolute inset-y-0 right-0 px-4 rounded-r-lg flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-700 group"
          >
            <SearchIcon className="w-5 h-5 text-lumi-primary dark:text-lumi-label" />
          </button>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchSubmit();
            }}
            className="pl-5 pr-14 py-2 w-[500px] rounded-lg bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none shadow-md"
          />
        </div>

        {/* Filtro */}
        {showFilterButton && (
          <div className="relative">
            <button
              id="filter-toggle-button"
              onClick={onFilterToggle}
              className={`flex items-center bg-white dark:bg-dark-card dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-700 shadow-md select-none group transition-colors ${
                isFilterOpen ? 'ring-2 ring-lumi-primary' : ''
              }`}
            >
              <span>Filtro Avançado</span>
              <FilterIcon
                className={`w-5 h-5 ml-2 -mr-1 text-lumi-primary dark:text-lumi-label ${
                  isFilterOpen ? '-rotate-90' : ''
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Adicionar */}
      <button
        onClick={onAddNew}
        className="flex items-center bg-green-500 text-white font-bold py-2 px-4 pl-3 rounded-lg hover:bg-green-600 active:bg-green-700 shadow-md"
      >
        <AddIcon className="w-6 h-6 mr-2 text-white" />
        <span>{addNewButtonLabel}</span>
      </button>
    </div>
  );
}
