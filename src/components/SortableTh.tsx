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
  const directionIcon = sortConfig?.direction === 'asc' ? '▲' : '▼';

  return (
    <th
      className={`py-2 px-2 cursor-pointer ${className}`}
      onClick={onClick}
      style={style}
    >
      <div className="flex items-center justify-center">
        <span>{children}</span>
        <span
          className={`ml-2 text-xs transition-all ${
            isSorted
              ? 'relative opacity-100 duration-200'
              : 'absolute opacity-0 duration-0'
          }`}
        >
          {directionIcon}
        </span>
      </div>
    </th>
  );
}
