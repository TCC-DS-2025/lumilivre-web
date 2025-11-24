import React from 'react';

type SortDirection = 'asc' | 'desc';

interface SortableThProps {
  children: React.ReactNode;
  onClick: () => void;
  sortKey: string;
  sortConfig: { key: string; direction: SortDirection } | null;
  className?: string;
  style?: React.CSSProperties;
}

export function SortableTh({
  children,
  onClick,
  sortKey,
  sortConfig,
  className,
  style,
}: SortableThProps) {
  const isSorted = sortConfig?.key === sortKey;
  const isAsc = sortConfig?.direction === 'asc';

  return (
    <div
      className={`relative h-full px-2 cursor-pointer select-none flex items-center justify-center transition-colors duration-200 ${className}`}
      onClick={onClick}
      style={style}
    >
      <span className="z-10">{children}</span>

      <span
        className={`
          absolute right-3 text-[10px] transition-transform duration-200
          ${isSorted ? 'opacity-100' : 'opacity-0'} 
          ${isAsc ? 'rotate-180' : 'rotate-0'}
        `}
      >
        ▼
      </span>
    </div>
  );
}
