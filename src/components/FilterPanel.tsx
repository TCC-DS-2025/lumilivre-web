import { useEffect, useState, type ReactNode } from 'react';

interface FilterPanelProps {
  isOpen: boolean;
  children: ReactNode;
  onApply: () => void;
  onClear: () => void;
  width?: string;
}

export function FilterPanel({
  isOpen,
  children,
  onApply,
  onClear,
  width = 'w-[700px]',
}: FilterPanelProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`absolute top-full left-1/2 -mt-3 -translate-x-1/2 bg-white dark:bg-dark-card rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 select-none
        ${width}
        ${isClosing ? 'animate-slide-up' : 'animate-slide-down'}
        `}
    >
      <div className="p-6 space-y-4">
        {children}

        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClear}
            className="font-semibold py-2 px-4 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Limpar
          </button>
          <button
            onClick={onApply}
            className="bg-lumi-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-lumi-primary-hover transform hover:scale-105 shadow-md"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
