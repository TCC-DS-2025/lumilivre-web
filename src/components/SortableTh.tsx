import React from 'react';

type SortDirection = 'asc' | 'desc';

interface SortableThProps {
    children: React.ReactNode;
    onClick: () => void;
    sortKey: string;
    sortConfig: { key: string; direction: SortDirection } | null;
}

export function SortableTh({ children, onClick, sortKey, sortConfig }: SortableThProps) {
    const isSorted = sortConfig?.key === sortKey;
    const directionIcon = sortConfig?.direction === 'asc' ? '▲' : '▼';

    return (
        <th className="py-2 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 text-center" onClick={onClick}>
            <div className="flex items-center justify-center">
                <span>{children}</span>
                {isSorted && <span className="ml-2 text-xs">{directionIcon}</span>}
            </div>
        </th>
    );
}