import React from 'react';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg?react';
import ArrowRightIcon from '../assets/icons/arrow-right.svg?react';
import { CustomSelect } from './CustomSelect'; 

interface LegendItem {
  color: string;
  label: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

interface TableFooterProps {
  legendItems?: LegendItem[];
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  viewMode?: 'normal' | 'exception';
}

const StatusLegend: React.FC<{ items: LegendItem[] }> = ({ items }) => (
  <div className="flex items-center space-x-4 pl-2">
    {items.map((item) => (
      <div key={item.label} className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full shadow-md ${item.color}`} />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {item.label}
        </span>
      </div>
    ))}
  </div>
);

export function TableFooter({
  legendItems,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  viewMode = 'normal',
}: TableFooterProps) {
  const { currentPage, totalPages, itemsPerPage, totalItems } = pagination;

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const navButtonClass =
    'p-1.5 rounded-md transition-colors duration-200 ' +
    'hover:bg-gray-200 dark:hover:bg-gray-700 ' +
    'active:bg-gray-300 dark:active:bg-gray-600 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:bg-transparent';

  const iconClass = 'w-4 h-4 text-lumi-primary dark:text-lumi-label';

  const pageSizeOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
  ];

  const PageSizeControl = (
    <div className="flex items-center space-x-2">
      <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 transition-all duration-200">
        Itens por página:
      </span>
      
      <div className="w-20"> 
        <CustomSelect
          value={itemsPerPage}
          options={pageSizeOptions}
          onChange={(value) => onItemsPerPageChange(Number(value))}
          placeholder="Qtd"
          direction="up"
        />
      </div>
    </div>
  );

  const ItemCounter = (
    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
      {startItem}-{endItem} de {totalItems}
    </span>
  );

  const NavigationControls = (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={navButtonClass}
        title="Página Anterior"
      >
        <ArrowLeftIcon className={iconClass} />
      </button>
      <span className="text-sm font-semibold text-gray-800 dark:text-white min-w-[1.5rem] text-center">
        {currentPage}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className={navButtonClass}
        title="Próxima Página"
      >
        <ArrowRightIcon className={iconClass} />
      </button>
    </div>
  );

  const isException = viewMode === 'exception';

  return (
    <div className="flex items-center justify-between p-1.5 border-t border-gray-200 dark:border-gray-700 shrink-0 transition-all duration-200 select-none bg-white dark:bg-dark-card rounded-b-lg">
      <div className={isException ? 'pl-2' : 'flex-1'}>
        {isException
          ? PageSizeControl
          : legendItems && legendItems.length > 0 && <StatusLegend items={legendItems} />}
      </div>

      <div
        className={`flex items-center pr-2 ${isException ? 'space-x-4' : 'space-x-6'}`}
      >
        {!isException && PageSizeControl}
        {ItemCounter}
        {NavigationControls}
      </div>
    </div>
  );
}