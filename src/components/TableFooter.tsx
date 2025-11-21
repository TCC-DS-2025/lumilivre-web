import React, { useState, useRef, useEffect } from 'react';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg?react';
import ArrowRightIcon from '../assets/icons/arrow-right.svg?react';

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

interface PageSizeSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options: number[];
}

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  value,
  onChange,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-lumi-primary transition-all duration-200
          ${
            isOpen
              ? 'bg-gray-200 dark:bg-gray-600'
              : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
          }
        `}
      >
        <span>{value}</span>
        <span
          className={`text-[10px] ml-1 opacity-70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          ▼
        </span>
      </button>

      <div
        className={`absolute bottom-full left-0 mb-1 w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 overflow-hidden origin-bottom transition-all duration-200 ease-out
          ${
            isOpen
              ? 'opacity-100 scale-y-100 translate-y-0'
              : 'opacity-0 scale-y-0 translate-y-2 pointer-events-none'
          }
        `}
      >
        {options.map((option) => (
          <button
            key={option}
            onClick={() => {
              onChange(option);
              setIsOpen(false);
            }}
            className={`
              w-full text-left px-3 py-2 text-sm transition-colors duration-150
              ${
                value === option
                  ? 'bg-lumi-primary/10 text-lumi-primary font-bold'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

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

  const PageSizeControl = (
    <div className="flex items-center space-x-2">
      <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 transition-all duration-200">
        Itens por página:
      </span>
      <PageSizeSelector
        value={itemsPerPage}
        onChange={onItemsPerPageChange}
        options={[10, 25, 50]}
      />
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
          ?
            PageSizeControl
          :
            legendItems &&
            legendItems.length > 0 && <StatusLegend items={legendItems} />}
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
