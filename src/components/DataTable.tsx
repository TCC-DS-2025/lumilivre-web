import React from 'react';

import { LoadingIcon } from './LoadingIcon';
import { SortableTh } from './SortableTh';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading: boolean;
  error: string | null;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
  getRowKey: (item: T) => string | number;
  getRowClass?: (item: T) => string;
  emptyStateMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
  sortConfig,
  onSort,
  getRowKey,
  getRowClass,
  emptyStateMessage = 'Nenhum item encontrado.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-y-auto flex-grow bg-white dark:bg-dark-card transition-all duration-200 rounded-t-lg">
      <table className="min-w-full table-auto">
        <thead className="sticky top-0 bg-lumi-primary shadow-md z-10 text-white">
          <tr>
            {columns.map((col) => (
              <SortableTh
                key={col.key}
                onClick={() => onSort(col.key)}
                sortConfig={sortConfig}
                sortKey={col.key}
                className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                style={{ width: col.width }}
              >
                {col.header}
              </SortableTh>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y text-center bg-white dark:bg-dark-card transition-all duration-200">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length}>
                <LoadingIcon />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-red-500">
                {error}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-gray-500">
                {emptyStateMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={getRowKey(item)}
                className={
                  getRowClass
                    ? getRowClass(item)
                    : 'transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:duration-0'
                }
              >
                {columns.map((col) => (
                  <td
                    key={`${getRowKey(item)}-${col.key}`}
                    className="p-4 whitespace-nowrap"
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
