import React from 'react';

import arrowIconLeft from '../assets/icons/arrow-left.svg';
import arrowIconRight from '../assets/icons/arrow-right.svg';

interface LegendItem {
  // tipo de legenda
  color: string;
  label: string;
}

interface PaginationState {
  // paginação
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

interface TableFooterProps {
  legendItems?: LegendItem[]; // opcional
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
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
}: TableFooterProps) {
  const { currentPage, totalPages, itemsPerPage, totalItems } = pagination;

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between p-2 border-t border-gray-200 dark:border-gray-700 shrink-0 select-none">
      <div className="flex-1">
        {legendItems && legendItems.length > 0 && (
          <StatusLegend items={legendItems} />
        )}
      </div>

      {/* paginação */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Itens por página:
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="p-1 rounded-md bg-white dark:bg-gray-700 text-sm dark:text-white border shadow-lg dark:border-gray-600 hover:bg-gray-200 dark:hover:opacity-75 focus:ring-2 focus:ring-lumi-primary outline-none transition-all duration-200 select-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* contador */}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {startItem}-{endItem} de {totalItems}
        </span>

        {/* navegação */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <img
              src={arrowIconLeft}
              className="w-4 h-4"
              alt="Seta para a Esquerda"
            />
          </button>
          <span className="text-sm font-semibold dark:text-white">{currentPage}</span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <img
              src={arrowIconRight}
              className="w-4 h-4"
              alt="Seta para a Direita"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
