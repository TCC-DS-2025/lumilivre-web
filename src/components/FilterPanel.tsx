import { useEffect, useRef, useState, type ReactNode } from 'react';

interface FilterPanelProps {
  isOpen: boolean;
  children: ReactNode;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
  width?: string;
}

export function FilterPanel({
  isOpen,
  children,
  onApply,
  onClear,
  onClose,
  width = 'w-[600px]',
}: FilterPanelProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;

      const target = event.target as Element;
      const toggleButton = document.getElementById('filter-toggle-button');

      const isInsideDropdownPortal = target.closest('[id^="dropdown-portal-"]');

      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        toggleButton &&
        !toggleButton.contains(target) &&
        !isInsideDropdownPortal
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      ref={panelRef}
      className={`absolute top-full left-20 mt-2 origin-top-left bg-white dark:bg-dark-card rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 select-none
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
