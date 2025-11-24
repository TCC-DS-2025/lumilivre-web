import React, { useEffect, useRef, useState } from 'react';

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
  headerClassName?: string;
  headerTextClassName?: string;
  hoverHeaderClassName?: string;
  hasRoundedBorderTop?: boolean;
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
  headerClassName = 'h-12 bg-lumi-primary shadow-md',
  headerTextClassName = 'text-white',
  hoverHeaderClassName = 'hover:bg-white/20',
  hasRoundedBorderTop = true,
}: DataTableProps<T>) {
  const [hasScroll, setHasScroll] = useState(false);
  const tableBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkForScroll = () => {
      const element = tableBodyRef.current;
      if (element) {
        const hasVerticalScroll = element.scrollHeight > element.clientHeight;
        setHasScroll(hasVerticalScroll);
      }
    };

    const timeoutId = setTimeout(checkForScroll, 0);

    window.addEventListener('resize', checkForScroll);
    return () => {
      window.removeEventListener('resize', checkForScroll);
      clearTimeout(timeoutId);
    };
  }, [data]);

  return (
    <div
      className={`flex flex-col h-full overflow-hidden bg-white dark:bg-dark-card ${
        hasRoundedBorderTop ? 'rounded-t-lg' : ''
      }`}
    >
      <div
        className={`flex items-stretch shrink-0 z-10 ${headerClassName}`}
      >
        {columns.map((col, index) => {
          const isLast = index === columns.length - 1;
          const scrollPaddingClass = isLast && hasScroll ? 'mr-[14px]' : '';

          return col.isSortable === false ? (
            <div
              key={col.key}
              className={`h-full px-2 text-sm font-bold tracking-wider text-center flex items-center justify-center ${headerTextClassName} ${scrollPaddingClass}`}
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
              className={`text-sm font-bold tracking-wider ${headerTextClassName} ${hoverHeaderClassName} ${scrollPaddingClass}`}
              style={{ width: col.width }}
            >
              {col.header}
            </SortableTh>
          );
        })}
      </div>

      <div 
        ref={tableBodyRef} 
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
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
                    className="px-2 py-3 whitespace-nowrap flex justify-center items-center overflow-hidden"
                    style={{ width: col.width }}
                  >
                    <div className="w-full flex justify-center">
                      {col.render(item)}
                    </div>
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