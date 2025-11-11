import { type ReactNode } from 'react';

import searchIconUrl from '../assets/icons/search.svg';
import filterIconUrl from '../assets/icons/filter.svg';
import addIconUrl from '../assets/icons/add.svg';

interface ActionHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchPlaceholder: string;

  onAddNew: () => void;
  addNewButtonLabel: string;

  onFilterToggle?: () => void;
  showFilterButton?: boolean;

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
  children,
}: ActionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 shrink-0">
      <div className="flex items-center space-x-4">
        {children}

        <div className="relative ml-3 mr-2 transition-all duration-200 select-none">
          <button
            onClick={onSearchSubmit}
            className="absolute inset-y-0 right-0 px-4 rounded-r-lg flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <img src={searchIconUrl} alt="Pesquisar" className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchSubmit();
            }}
            className="pl-5 py-2 w-[500px] rounded-lg bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none shadow-md transition-all duration-200"
          />
        </div>

        {showFilterButton && (
          <div className="relative">
            <button
              onClick={onFilterToggle}
              className="flex items-center bg-white dark:bg-dark-card dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110 shadow-md select-none"
            >
              <span>Filtro Avançado</span>
              <img src={filterIconUrl} alt="Filtros" className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onAddNew}
        className="flex items-center mr-3 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-md"
      >
        <img src={addIconUrl} alt="Adicionar" className="w-6 h-6 mr-2" />
        <span>{addNewButtonLabel}</span>
      </button>
    </div>
  );
}
