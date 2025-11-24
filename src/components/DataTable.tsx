import React from 'react';

import { LoadingIcon } from './LoadingIcon';
import { SortableTh } from './SortableTh';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  isSortable?: boolean;
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
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-dark-card rounded-t-lg">
      <div className="h-12 flex items-stretch shrink-0 bg-lumi-primary shadow-md z-10 text-white pr-2">
        {columns.map((col) =>
          col.isSortable === false ? (
            <div
              key={col.key}
              className="h-full px-3 text-sm font-bold text-white tracking-wider text-center flex items-center justify-center"
              style={{ width: col.width }}
            >
              {col.header}
            </div>
          ) : (
            <SortableTh
              key={col.key}
              onClick={() => onSort(col.key)}
              sortConfig={sortConfig}
              sortKey={col.key}
              className="text-sm font-bold text-white tracking-wider hover:bg-white/20"
              style={{ width: col.width }}
            >
              {col.header}
            </SortableTh>
          ),
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <LoadingIcon />
          </div>
        ) : error ? (
          <div className="p-8 text-red-500 text-center">{error}</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-gray-500 text-center">
            {emptyStateMessage}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item) => (
              <div
                key={getRowKey(item)}
                className={`flex items-center ${
                  getRowClass
                    ? getRowClass(item)
                    : 'hover:bg-gray-300 dark:hover:bg-gray-600 hover:duration-0'
                }`}
              >
                {columns.map((col) => (
                  <div
                    key={`${getRowKey(item)}-${col.key}`}
                    className="p-4 whitespace-nowrap text-center overflow-hidden text-ellipsis"
                    style={{ width: col.width }}
                  >
                    {col.render(item)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
