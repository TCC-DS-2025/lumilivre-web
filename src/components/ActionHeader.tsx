import { type ReactNode } from 'react';

import SearchIcon from '../assets/icons/search.svg?react';
import FilterIcon from '../assets/icons/filter.svg?react';
import AddIcon from '../assets/icons/add.svg?react';
import CloseIcon from '../assets/icons/close-sm.svg?react';

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
  inputWidth?: string;
  filterComponent?: ReactNode;
  onReset?: () => void;
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
  inputWidth = 'w-[500px]',
  filterComponent,
  onReset,
}: ActionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 shrink-0 relative z-40">
      <div className="flex items-center space-x-3">
        {children}

        {/* Barra de Pesquisa */}
        <div className="relative mr-2 select-none">
          <button
            onClick={onSearchSubmit}
            aria-label="Pesquisar"
            className="absolute inset-y-0 right-0 px-4 rounded-r-lg flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-700 group z-10"
          >
            <SearchIcon className="w-5 h-5 text-lumi-primary dark:text-lumi-label" />
          </button>

          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              const newValue = e.target.value;
              onSearchChange(newValue);

              if (newValue === '' && onReset) {
                onReset();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchSubmit();
            }}
            className={`pl-5 pr-20 py-2 ${inputWidth} rounded-lg bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none shadow-md`}
          />

          {searchTerm && onReset && (
            <button
              onClick={onReset}
              className="absolute inset-y-0 right-14 px-2 flex items-center text-gray-400 hover:text-red-500 transition-colors"
              title="Limpar pesquisa"
            >
              <CloseIcon className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>

        {/* Filtro */}
        {showFilterButton && (
          <div className="relative z-50">
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

            {filterComponent}
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
